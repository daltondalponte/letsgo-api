
import { User } from '@application/user/entity/User';
import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe('sk_test_51NagwlGiMV6RYH8nDpFcIRLn8zPqzPc96RYVRBWGyoQt76GbKU4lBJOltzdT9Xf9hyTT8NnDVIq0BCJwKrghFToD00J11FCoV4', {
            apiVersion: "2025-06-30.basil"
        });
    }

    constructEvent(payload: string | Buffer, header: string | Buffer | string[],) {
        return this.stripe.webhooks.constructEvent(payload, header, process.env.STRIPEENDPOINTSECRET)
    }

    async createConnectAccount(email: string) {
        const account = await this.stripe.accounts.create({
            type: 'express',
            email: email
        });

        return account
    }

    async createAccountLink(accountId: string) {
        const accountLink = await this.stripe.accountLinks.create({
            account: accountId,
            return_url: 'https://letsgo.app.br/backToApp',
            refresh_url: 'https://letsgo.app.br/backToApp',
            type: 'account_onboarding',
        });

        return accountLink
    }

    async retrieveAccount(accountId: string) {
        try {
            const account = await this.stripe.accounts.retrieve(accountId)
            return account
        } catch (error) {
            console.error(error);
            throw new BadRequestException(error?.message)
        }
    }

    async createCustomer(user: User) {

        const customer = await this.stripe.customers.create({
            email: user.email,
            name: user.name,
        });

        return customer.id;
    }

    async retrieveCustomer(id: string) {
        const customer = await this.stripe.customers.retrieve(id)
        return customer
    }

    async retrievePaymentIntent(id: string) {
        return await this.stripe.paymentIntents.retrieve(id)
    }

    async retrievePaymentMethods(customerId: string) {
        const paymentMethods = await this.stripe.customers.listPaymentMethods(customerId)

        return paymentMethods.data
    }


    async attachPaymentMethod(paymentMethodId: string, customerId: string) {
        await this.stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })
    }

    async detachPaymentMethod(paymentMethodId: string) {
        await this.stripe.paymentMethods.detach(paymentMethodId)
    }

    async createPaymentIntent(amount: number, tax: number, destination: string, purchaseId: string, paymentId: string, customerId: string, userDeviceToken: string) {
        const ephemeralKey = await this.stripe.ephemeralKeys.create(
            { customer: customerId },
            { apiVersion: '2025-06-30.basil' }
        );
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount,
            currency: 'brl',
            customer: customerId,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                letsgo_purchase_id: purchaseId,
                letsgo_payment_id: paymentId,
                letsgo_user_devicetoken: userDeviceToken
            },
            application_fee_amount: tax,
            transfer_data: {
                destination
            },
        });

        return {
            ephemeralKey: ephemeralKey.secret,
            paymentIntent: paymentIntent.client_secret
        }
    }
}
