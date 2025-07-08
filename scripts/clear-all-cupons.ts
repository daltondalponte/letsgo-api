import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAllCupons() {
  try {
    console.log('🗑️  Iniciando limpeza de todos os cupons...');
    
    // Contar cupons antes da limpeza
    const countBefore = await prisma.cupom.count();
    console.log(`📊 Cupons encontrados: ${countBefore}`);
    
    if (countBefore === 0) {
      console.log('✅ Nenhum cupom encontrado para deletar.');
      return;
    }
    
    // Primeiro deletar registros de auditoria relacionados aos cupons
    console.log('🧹 Deletando registros de auditoria...');
    const auditResult = await prisma.cupomAudit.deleteMany({});
    console.log(`✅ ${auditResult.count} registros de auditoria deletados`);
    
    // Agora deletar todos os cupons
    console.log('🗑️  Deletando cupons...');
    const result = await prisma.cupom.deleteMany({});
    
    console.log(`✅ ${result.count} cupons deletados com sucesso!`);
    console.log('🎉 Banco de dados limpo para novos testes!');
    
  } catch (error) {
    console.error('❌ Erro ao limpar cupons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
clearAllCupons(); 