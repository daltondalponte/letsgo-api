import { Controller, Req, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StripeService } from '@infra/payment/stripe.service';
import Stripe from 'stripe';
import { UpdatePayment } from '@application/payment/use-cases/update-payment';
import { PaymentStatus } from '@application/payment/entity/Payment';

/**
 * Controller responsável por ouvir os eventos da Stripe.
 * Esta classe fornece uma rota para ouvir as mensagens de um determinado pagamento,
 * bem como realizar ataulaizações na plataforma e enviar notificações para o usuário se necessário.
 */


@ApiTags("WebHook")
@Controller('webhook')
export class WebHookController {

    constructor(
        private stripe: StripeService,
        private updatePayment: UpdatePayment
    ) { }

    @Post()
    async stripeWebhook(@Req() req) {
        const sig = req.headers['stripe-signature'];

        let event: Stripe.Event;

        try {
            event = this.stripe.constructEvent(req.rawBody, sig);
        } catch (err) {
            console.log(err);

            throw new BadRequestException(`Webhook Error: ${err.message}`)
        }

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                // O pagamento foi bem sucessido
                // Completa o pagamento na plataforma, bilhete fica válido
                const paymentIntentSucceeded = event.data.object as any;
                await this.updatePayment.execute({ paymentId: paymentIntentSucceeded.metadata.letsgo_payment_id, status: PaymentStatus.COMPLETED })
                break;
            case 'payment_intent.canceled':
                // O pagamento foi cancelado
                // Cancela o pagamento na plataforma, bilhete fica inválido
                const paymentIntentCanceled = event.data.object as any;
                await this.updatePayment.execute({ paymentId: paymentIntentCanceled.metadata.letsgo_payment_id, status: PaymentStatus.CANCELED })
                break;
            case 'payment_intent.payment_failed':
                // O pagamento falhou
                // Cancela o pagamento na plataforma, bilhete fica inválido
                const paymentIntentFailed = event.data.object as any;
                await this.updatePayment.execute({ paymentId: paymentIntentFailed.metadata.letsgo_payment_id, status: PaymentStatus.FAILED })
                break;
            case 'charge.refund.updated':
                // Evento disparado quando um reembolso é feito ao cliente.
                // Cancela o pagamento na plataforma, bilhete fica inválido
                const charge = event.data.object as any;
                if (charge.status === "succeeded") {
                    const paymentIntent = await this.stripe.retrievePaymentIntent(charge.payment_intent)
                    await this.updatePayment.execute({ paymentId: paymentIntent.metadata.letsgo_payment_id, status: PaymentStatus.CANCELED })
                }
                break;
            // ... handle other event types
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        // Return a 200 response to acknowledge receipt of the event
        return { message: "success" }
    }


}