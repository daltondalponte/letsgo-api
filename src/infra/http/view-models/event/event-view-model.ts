import { Event } from "@application/event/entity/Event";

export class EventViewModel {
    static toHTTP(event: any) {
        // Converter fotos para URLs completas
        const processedPhotos = event.photos ? event.photos.map((photo: string) => {
            // Se é apenas o nome do arquivo, converter para URL completa
            if (photo && photo.startsWith('events/')) {
                return `/api/image-proxy?file=${encodeURIComponent(photo)}`;
            }
            // Se não é o formato esperado, retornar como está
            return photo;
        }) : [];

        // Determinar o status do evento se não estiver presente
        let approvalStatus = event.approvalStatus;
        if (!approvalStatus) {
            if (event.isActive) {
                // Se o evento está ativo, verificar se já passou
                const now = new Date();
                const eventStartDate = new Date(event.dateTimestamp);
                const eventEndDate = event.endTimestamp ? new Date(event.endTimestamp) : null;
                
                // Se tem horário de término, usar ele. Senão, usar apenas o início
                const eventEndTime = eventEndDate || eventStartDate;
                
                if (now > eventEndTime) {
                    approvalStatus = 'FINALIZADO';
                } else {
                    // Eventos ativos são sempre aprovados
                    approvalStatus = 'APPROVED';
                }
            } else {
                // Se não está ativo, é pendente de aprovação
                approvalStatus = 'PENDING';
            }
        }

        // Debug: verificar se ManageEvents está presente
        return {
            id: event.id,
            name: event.name,
            description: event.description,
            dateTimestamp: event.dateTimestamp,
            endTimestamp: event.endTimestamp,
            address: event.address,
            photos: processedPhotos,
            listNames: event.listNames,
            isActive: event.isActive,
            establishmentId: event.establishmentId,
            useruid: event.useruid,
            coordinates_event: event.coordinates_event,
            establishment: event.establishment,
            user: event.user,
            creator: event.creator,
            managers: event.ManageEvents, // Usar ManageEvents como managers
            tickets: event.tickets,
            approvalStatus: approvalStatus,
            ManageEvents: event.ManageEvents,
            Ticket: event.Ticket,
        };
    }
}