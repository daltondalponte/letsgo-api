import { Injectable } from "@nestjs/common";
import { EventRepository } from "../repositories/event-repository";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

interface DeleteEventRequest {
    id: string;
    useruid: string;
}

interface DeleteEventResponse {
    message: string;
}

@Injectable()
export class DeleteEvent {
    // Configurações do Cloudflare R2
    private readonly CLOUDFLARE_CONFIG = {
        accountId: 'd0966b8c9dc94cd73c466c563dab7a66',
        bucketName: 'letsgo-images',
        endpoint: 'https://d0966b8c9dc94cd73c466c563dab7a66.r2.cloudflarestorage.com',
        accessKeyId: '496297cfaacf1a28a51dcb803db187f0',
        secretAccessKey: '012d556a5a658135e4529d2e9794b3be4aa47ef7a892cc3d825aed68112afa7d',
    };

    private readonly s3Client = new S3Client({
        region: 'auto',
        endpoint: this.CLOUDFLARE_CONFIG.endpoint,
        credentials: {
            accessKeyId: this.CLOUDFLARE_CONFIG.accessKeyId,
            secretAccessKey: this.CLOUDFLARE_CONFIG.secretAccessKey,
        },
    });

    constructor(
        private eventRepository: EventRepository
    ) { }

    async execute(request: DeleteEventRequest): Promise<DeleteEventResponse> {
        const { id, useruid } = request;

        // Verificar se o evento existe e se o usuário tem permissão
        const event = await this.eventRepository.findById(id);
        if (!event) {
            throw new Error('Evento não encontrado');
        }

        // Verificar se o usuário é o dono do evento
        if (event.useruid !== useruid) {
            throw new Error('Você não tem permissão para excluir este evento');
        }

        // Verificar se há vendas de ingressos para este evento
        const hasSales = await this.eventRepository.hasTicketSales(id);
        if (hasSales) {
            throw new Error('Não é possível excluir um evento que possui vendas de ingressos');
        }

        // Deletar fotos do Cloudflare antes de deletar o evento
        if (event.photos && event.photos.length > 0) {
            await this.deletePhotosFromCloudflare(event.photos);
        }

        // Deletar o evento
        await this.eventRepository.delete(id);

        return { message: 'Evento excluído com sucesso' };
    }

    private async deletePhotosFromCloudflare(photos: string[]): Promise<void> {
        const deletePromises = photos.map(async (fileName) => {
            try {
                // As fotos são salvas apenas com o nome do arquivo (ex: events/1234567890-uuid.jpg)
                if (fileName && fileName.startsWith('events/')) {
                    await this.s3Client.send(new DeleteObjectCommand({
                        Bucket: this.CLOUDFLARE_CONFIG.bucketName,
                        Key: fileName,
                    }));
                }
            } catch (error) {
                console.error(`Erro ao deletar foto do Cloudflare: ${fileName}`, error);
                // Não interromper o processo se uma foto falhar
            }
        });

        await Promise.all(deletePromises);
    }
} 