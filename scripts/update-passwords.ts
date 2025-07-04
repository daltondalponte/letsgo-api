import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function updatePasswords() {
  try {
    console.log('🔧 Atualizando senhas dos usuários existentes...\n');

    // Hash da nova senha (8 caracteres)
    const newHashedPassword = await bcrypt.hash('12345678', 10);

    // Buscar todos os usuários
    const users = await prisma.user.findMany();
    
    console.log(`📊 Encontrados ${users.length} usuários no banco`);

    // Atualizar senha de todos os usuários
    for (const user of users) {
      await prisma.user.update({
        where: { uid: user.uid },
        data: { password: newHashedPassword }
      });
      console.log(`✅ Senha atualizada para: ${user.email}`);
    }

    console.log('\n🎉 Todas as senhas foram atualizadas com sucesso!');
    console.log('\n📋 Credenciais de acesso:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const user of users) {
      console.log(`📧 ${user.email} | 🔑 12345678 | 🏷️ ${user.type}`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Agora você pode fazer login com qualquer usuário usando a senha: 12345678');

  } catch (error) {
    console.error('❌ Erro ao atualizar senhas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePasswords(); 