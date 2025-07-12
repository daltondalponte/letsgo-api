import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpando TODOS os eventos do banco de dados...');

  try {
    // 1. Remover vendas de tickets (primeiro por causa das foreign keys)
    console.log('📋 Removendo vendas de tickets...');
    await prisma.ticketSale.deleteMany({});
    console.log('✅ Vendas de tickets removidas');

    // 2. Remover cupons aplicados
    console.log('📋 Removendo cupons aplicados...');
    await prisma.cuponsAplicados.deleteMany({});
    console.log('✅ Cupons aplicados removidos');

    // 3. Remover tickets
    console.log('📋 Removendo tickets...');
    await prisma.ticket.deleteMany({});
    console.log('✅ Tickets removidos');

    // 4. Remover managers/receptionists dos eventos
    console.log('📋 Removendo managers dos eventos...');
    await prisma.eventsReceptionist.deleteMany({});
    console.log('✅ Managers removidos');

    // 5. Remover aprovações dos eventos
    console.log('📋 Removendo aprovações dos eventos...');
    await prisma.eventApprovals.deleteMany({});
    console.log('✅ Aprovações removidas');

    // 6. Remover auditorias dos eventos
    console.log('📋 Removendo auditorias dos eventos...');
    await prisma.eventAudit.deleteMany({});
    console.log('✅ Auditorias de eventos removidas');

    // 7. Remover auditorias de cupons (antes dos cupons)
    console.log('📋 Removendo auditorias de cupons...');
    await prisma.cupomAudit.deleteMany({});
    console.log('✅ Auditorias de cupons removidas');

    // 8. Remover cupons
    console.log('📋 Removendo cupons...');
    await prisma.cupom.deleteMany({});
    console.log('✅ Cupons removidos');

    // 8. Remover TODOS os eventos
    console.log('📋 Removendo TODOS os eventos...');
    const deletedEvents = await prisma.event.deleteMany({});
    console.log(`✅ ${deletedEvents.count} eventos removidos`);

    console.log('🎉 Limpeza completa concluída com sucesso!');
    console.log('📊 Resumo:');
    console.log(`   - ${deletedEvents.count} eventos removidos`);
    console.log('   - Todos os tickets removidos');
    console.log('   - Todas as vendas removidas');
    console.log('   - Todos os cupons removidos');

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 