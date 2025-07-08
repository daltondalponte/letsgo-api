import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCuponsUseruid() {
  try {
    console.log('Atualizando cupons existentes...');
    
    // Buscar um usuário owner para associar os cupons
    const owner = await prisma.user.findFirst({
      where: {
        type: 'PROFESSIONAL_OWNER'
      }
    });

    if (!owner) {
      console.log('Nenhum usuário owner encontrado');
      return;
    }

    console.log('Usuário owner encontrado:', owner.uid);

    // Atualizar cupons que têm useruid null
    const result = await prisma.cupom.updateMany({
      where: {
        useruid: null
      },
      data: {
        useruid: owner.uid
      }
    });

    console.log(`Cupons atualizados: ${result.count}`);
    
    // Verificar cupons após atualização
    const cupons = await prisma.cupom.findMany();
    console.log('Cupons após atualização:', cupons.map(c => ({
      id: c.id,
      code: c.code,
      useruid: c.useruid
    })));

  } catch (error) {
    console.error('Erro ao atualizar cupons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCuponsUseruid(); 