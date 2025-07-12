const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedEstablishments() {
  try {
    console.log('🌱 Inserindo estabelecimentos de teste...');

    // Primeiro, vamos verificar se há usuários no banco
    const users = await prisma.user.findMany({
      where: {
        type: 'PROFESSIONAL_OWNER'
      },
      take: 3
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário PROFESSIONAL_OWNER encontrado. Criando usuário de teste...');
      
      // Criar um usuário de teste
      const testUser = await prisma.user.create({
        data: {
          uid: 'test-owner-1',
          email: 'owner1@test.com',
          name: 'João Silva',
          type: 'PROFESSIONAL_OWNER',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      users.push(testUser);
    }

    // Dados dos estabelecimentos de teste
    const establishmentsData = [
      {
        name: 'Bar do Centenário',
        address: 'Rua das Flores, 123 - Centro, São Paulo - SP',
        userOwnerUid: users[0].uid,
        photos: ['https://via.placeholder.com/300x200'],
        coordinates: { latitude: -23.5505, longitude: -46.6333 },
        description: 'Bar tradicional no centro da cidade',
        contactPhone: '(11) 99999-9999',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Casa Noturna Eclipse',
        address: 'Av. Paulista, 456 - Bela Vista, São Paulo - SP',
        userOwnerUid: users[0].uid,
        photos: ['https://via.placeholder.com/300x200'],
        coordinates: { latitude: -23.5605, longitude: -46.6433 },
        description: 'Casa noturna moderna na Paulista',
        contactPhone: '(11) 88888-8888',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Teatro das Artes',
        address: 'Rua Augusta, 789 - Consolação, São Paulo - SP',
        userOwnerUid: users[0].uid,
        photos: ['https://via.placeholder.com/300x200'],
        coordinates: { latitude: -23.5705, longitude: -46.6533 },
        description: 'Teatro histórico com programação cultural',
        contactPhone: '(11) 77777-7777',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Inserir estabelecimentos
    for (const establishmentData of establishmentsData) {
      const establishment = await prisma.establishment.create({
        data: establishmentData
      });
      console.log(`✅ Estabelecimento criado: ${establishment.name} (ID: ${establishment.id})`);
    }

    console.log('🎉 Estabelecimentos de teste inseridos com sucesso!');
    
    // Verificar se foram inseridos
    const allEstablishments = await prisma.establishment.findMany();
    console.log(`📊 Total de estabelecimentos no banco: ${allEstablishments.length}`);
    
    allEstablishments.forEach(est => {
      console.log(`📍 ${est.name} - Coordenadas: ${JSON.stringify(est.coordinates)}`);
    });

  } catch (error) {
    console.error('❌ Erro ao inserir estabelecimentos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedEstablishments(); 