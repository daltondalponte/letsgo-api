import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupUsers() {
  try {
    console.log('🔍 Buscando usuários PERSONAL...');
    
    // Buscar todos os usuários PERSONAL
    const personalUsers = await prisma.user.findMany({
      where: {
        type: 'PERSONAL'
      },
      select: {
        uid: true,
        name: true,
        email: true,
        type: true,
        createdAt: true
      }
    });

    console.log(`📊 Encontrados ${personalUsers.length} usuários PERSONAL:`);
    personalUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.createdAt}`);
    });

    // Filtrar usuários que NÃO são do Antonio
    const usersToDelete = personalUsers.filter(user => 
      user.email !== 'antonio@gmail.com'
    );

    console.log(`🗑️  Usuários que serão deletados (${usersToDelete.length}):`);
    usersToDelete.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
    });

    if (usersToDelete.length === 0) {
      console.log('✅ Nenhum usuário para deletar!');
      return;
    }

    // Deletar os usuários
    const deleteResult = await prisma.user.deleteMany({
      where: {
        type: 'PERSONAL',
        email: {
          not: 'antonio@gmail.com'
        }
      }
    });

    console.log(`✅ Deletados ${deleteResult.count} usuários com sucesso!`);

    // Verificar usuários restantes
    const remainingUsers = await prisma.user.findMany({
      where: {
        type: 'PERSONAL'
      },
      select: {
        name: true,
        email: true
      }
    });

    console.log('📋 Usuários PERSONAL restantes:');
    remainingUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
    });

  } catch (error) {
    console.error('❌ Erro ao limpar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupUsers(); 