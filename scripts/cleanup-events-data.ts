import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Fazendo limpeza profunda de dados antigos...');

  const eventIds = ['event-001', 'event-002', 'event-003', 'event-004', 'event-005'];
  const userIds = ['owner-002'];
  const establishmentIds = ['estab-002'];

  console.log('📋 Removendo vendas de tickets...');
  // Deletar vendas de tickets relacionadas aos eventos de teste
  await prisma.ticketSale.deleteMany({
    where: {
      OR: [
        {
          ticket: {
            eventId: { in: eventIds }
          }
        },
        {
          useruid: { in: userIds }
        }
      ]
    }
  });

  console.log('📋 Removendo cupons aplicados...');
  // Deletar cupons aplicados relacionados aos eventos de teste
  await prisma.cuponsAplicados.deleteMany({
    where: {
      ticketSale: {
        ticket: {
          eventId: { in: eventIds }
        }
      }
    }
  });

  console.log('📋 Removendo tickets...');
  // Deletar tickets dos eventos de teste
  await prisma.ticket.deleteMany({
    where: {
      eventId: { in: eventIds }
    }
  });

  console.log('📋 Removendo managers dos eventos...');
  // Deletar managers dos eventos de teste
  await prisma.eventsReceptionist.deleteMany({});

  console.log('📋 Removendo aprovações dos eventos...');
  // Deletar aprovações dos eventos de teste
  await prisma.eventApprovals.deleteMany({
    where: {
      OR: [
        { eventId: { in: eventIds } },
        { useruid: { in: userIds } }
      ]
    }
  });

  console.log('📋 Removendo auditorias dos eventos...');
  // Deletar auditorias dos eventos de teste
  await prisma.eventAudit.deleteMany({
    where: {
      OR: [
        { entityId: { in: eventIds } },
        { useruid: { in: userIds } }
      ]
    }
  });

  console.log('📋 Removendo cupons...');
  // Deletar cupons dos eventos de teste
  await prisma.cupom.deleteMany({
    where: {
      eventId: { in: eventIds }
    }
  });

  console.log('📋 Removendo eventos...');
  // Deletar eventos de teste
  await prisma.event.deleteMany({
    where: {
      OR: [
        { id: { in: eventIds } },
        { useruid: { in: userIds } }
      ]
    }
  });

  console.log('📋 Removendo estabelecimentos...');
  // Deletar estabelecimentos de teste
  await prisma.establishment.deleteMany({
    where: {
      OR: [
        { id: { in: establishmentIds } },
        { userOwnerUid: { in: userIds } },
        { name: { contains: 'Teatro Municipal' } }
      ]
    }
  });

  console.log('📋 Removendo usuários...');
  // Deletar usuário de teste
  await prisma.user.deleteMany({
    where: {
      OR: [
        { uid: { in: userIds } },
        { email: 'carlos@letsgo.com' },
        { name: { contains: 'Carlos Mendes' } }
      ]
    }
  });

  console.log('✅ Limpeza profunda concluída com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 