import { PrismaClient, UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createMasterUser() {
  try {
    // Verificar se já existe um usuário master
    const existingMaster = await prisma.user.findFirst({
      where: {
        type: UserType.MASTER
      }
    });

    if (existingMaster) {
      console.log('Usuário MASTER já existe:', existingMaster.email);
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Criar usuário MASTER
    const masterUser = await prisma.user.create({
      data: {
        uid: 'master-user-001',
        email: 'master@letsgo.com',
        name: 'Administrador Master',
        password: hashedPassword,
        type: UserType.MASTER,
        isActive: true,
        isOwnerOfEstablishment: false
      }
    });

    console.log('✅ Usuário MASTER criado com sucesso!');
    console.log('📧 Email:', masterUser.email);
    console.log('🔑 Senha: 123456');
    console.log('🆔 ID:', masterUser.uid);

  } catch (error) {
    console.error('❌ Erro ao criar usuário MASTER:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMasterUser(); 