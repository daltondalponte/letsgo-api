import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários no banco...');
    
    // Buscar todos os usuários
    const allUsers = await prisma.user.findMany({
      select: {
        uid: true,
        name: true,
        email: true,
        type: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📊 Total de usuários: ${allUsers.length}`);
    console.log('\n👥 Lista de usuários:');
    console.log('─'.repeat(80));
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Tipo: ${user.type} | Ativo: ${user.isActive} | Criado: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    // Contar por tipo
    const personalUsers = allUsers.filter(u => u.type === 'PERSONAL');
    const professionalUsers = allUsers.filter(u => u.type === 'PROFESSIONAL_OWNER' || u.type === 'PROFESSIONAL_PROMOTER');
    const masterUsers = allUsers.filter(u => u.type === 'MASTER');

    console.log('📈 Estatísticas por tipo:');
    console.log(`   PERSONAL: ${personalUsers.length}`);
    console.log(`   PROFESSIONAL: ${professionalUsers.length}`);
    console.log(`   MASTER: ${masterUsers.length}`);

    // Verificar se o Antonio existe
    const antonio = allUsers.find(u => u.email === 'antonio@gmail.com');
    if (antonio) {
      console.log('\n✅ Antonio encontrado:', antonio.name, `(${antonio.email})`);
    } else {
      console.log('\n❌ Antonio não encontrado no banco');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 