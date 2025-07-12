import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupEventsOnly() {
  try {
    console.log('🧹 Removendo apenas eventos e dados relacionados...');
    
    // Remover vendas de tickets primeiro (dependência de tickets)
    console.log('📋 Removendo vendas de tickets...');
    await prisma.ticketSale.deleteMany({});
    
    // Remover cupons aplicados (dependência de tickets)
    console.log('📋 Removendo cupons aplicados...');
    await prisma.cuponsAplicados.deleteMany({});
    
    // Remover tickets (dependência de eventos)
    console.log('📋 Removendo tickets...');
    await prisma.ticket.deleteMany({});
    
    // Remover managers dos eventos (dependência de eventos)
    console.log('📋 Removendo managers dos eventos...');
    await prisma.eventsReceptionist.deleteMany({});
    
    // Remover aprovações dos eventos (dependência de eventos)
    console.log('📋 Removendo aprovações dos eventos...');
    await prisma.eventApprovals.deleteMany({});
    
    // Remover auditorias dos eventos (dependência de eventos)
    console.log('📋 Removendo auditorias dos eventos...');
    await prisma.eventAudit.deleteMany({});
    
    // Remover cupons (dependência de eventos)
    console.log('📋 Removendo cupons...');
    await prisma.cupom.deleteMany({});
    
    // Finalmente, remover os eventos
    console.log('📋 Removendo eventos...');
    await prisma.event.deleteMany({});
    
    console.log('✅ Limpeza de eventos concluída com sucesso!');
    console.log('✅ Usuários e estabelecimentos foram mantidos.');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupEventsOnly(); 