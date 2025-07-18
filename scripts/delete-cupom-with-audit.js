const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteCupomWithAudit(cupomId) {
  try {
    console.log(`🗑️ Tentando deletar cupom ID: ${cupomId}`);
    
    const cupom = await prisma.cupom.findUnique({
      where: { id: cupomId },
      include: {
        event: {
          select: {
            name: true
          }
        }
      }
    });

    if (!cupom) {
      console.log('❌ Cupom não encontrado');
      return;
    }

    console.log(`📋 Detalhes do cupom:`);
    console.log(`   Código: ${cupom.code}`);
    console.log(`   Evento: ${cupom.event?.name || 'GLOBAL'}`);
    console.log(`   User UID: ${cupom.useruid}`);

    // Primeiro deletar registros de auditoria
    console.log('🗑️ Deletando registros de auditoria...');
    const auditCount = await prisma.cupomAudit.deleteMany({
      where: { entityId: cupomId }
    });
    console.log(`✅ ${auditCount.count} registros de auditoria deletados`);

    // Depois deletar o cupom
    console.log('🗑️ Deletando cupom...');
    await prisma.cupom.delete({
      where: { id: cupomId }
    });

    console.log('✅ Cupom deletado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao deletar cupom:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const args = process.argv.slice(2);

if (args.length > 0) {
  const cupomId = args[0];
  deleteCupomWithAudit(cupomId);
} else {
  console.log('❌ ID do cupom não fornecido');
  console.log('Uso: node scripts/delete-cupom-with-audit.js <ID_DO_CUPOM>');
}
