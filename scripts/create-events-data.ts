import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando criação de dados de eventos...');

  // Criar um novo usuário PROFESSIONAL_OWNER
  const newOwner = await prisma.user.create({
    data: {
      uid: 'owner-002',
      name: 'Carlos Mendes - Dono de Estabelecimento',
      email: 'carlos@letsgo.com',
      document: '111.222.333-44',
      phone: '(11) 99999-9999',
      birthDate: new Date('1985-08-15'),
      password: '123456', // Senha simples para teste
      type: 'PROFESSIONAL_OWNER',
      isActive: true,
      isOwnerOfEstablishment: true,
      avatar: null,
    },
  });

  console.log('✅ Novo usuário PROFESSIONAL_OWNER criado:', newOwner.name);

  // Criar estabelecimento para o novo usuário
  const newEstablishment = await prisma.establishment.create({
    data: {
      id: 'estab-002',
      name: 'Teatro Municipal de Eventos',
      address: 'Rua das Artes, 500 - Centro, São Paulo - SP',
      description: 'Teatro histórico com capacidade para 800 pessoas, ideal para shows e apresentações.',
      contactPhone: '(11) 4444-5555',
      website: 'https://teatromunicipal.com.br',
      socialMedia: {
        twitter: '@teatromunicipal',
        facebook: 'Teatro Municipal SP',
        instagram: '@teatromunicipalsp'
      },
      coordinates: {
        latitude: -23.5489,
        longitude: -46.6388
      },
      photos: [
        'https://example.com/teatro1.jpg',
        'https://example.com/teatro2.jpg'
      ],
      userOwnerUid: newOwner.uid,
    },
  });

  console.log('✅ Novo estabelecimento criado:', newEstablishment.name);

  // Buscar o estabelecimento existente (do owner-001)
  const existingEstablishment = await prisma.establishment.findFirst({
    where: {
      userOwnerUid: 'owner-001'
    }
  });

  if (!existingEstablishment) {
    console.error('❌ Estabelecimento do owner-001 não encontrado');
    return;
  }

  // Criar 5 eventos distribuídos entre os dois estabelecimentos
  const events = [
    {
      id: 'event-001',
      name: 'Show de Rock Clássico',
      description: 'Uma noite inesquecível com as maiores bandas de rock dos anos 80 e 90. Repertório com clássicos do Queen, Led Zeppelin, Pink Floyd e muito mais.',
      dateTimestamp: new Date('2024-12-15T20:00:00Z'),
      establishment: { connect: { id: existingEstablishment.id } },
      useruid: 'owner-001',
      photos: ['https://example.com/rock-show1.jpg', 'https://example.com/rock-show2.jpg'],
      isActive: true,
    },
    {
      id: 'event-002',
      name: 'Festival de Jazz',
      description: 'Festival anual de jazz com artistas nacionais e internacionais. 3 dias de música de qualidade em um ambiente sofisticado.',
      dateTimestamp: new Date('2024-12-20T19:30:00Z'),
      establishment: { connect: { id: existingEstablishment.id } },
      useruid: 'owner-001',
      photos: ['https://example.com/jazz-fest1.jpg'],
      isActive: true,
    },
    {
      id: 'event-003',
      name: 'Stand-up Comedy Night',
      description: 'Noite de comédia com os melhores comediantes da cidade. Ria até não aguentar mais!',
      dateTimestamp: new Date('2024-12-25T21:00:00Z'),
      establishment: { connect: { id: existingEstablishment.id } },
      useruid: 'owner-001',
      photos: ['https://example.com/comedy1.jpg'],
      isActive: true,
    },
    {
      id: 'event-004',
      name: 'Ópera: La Traviata',
      description: 'Apresentação da famosa ópera de Verdi com orquestra sinfônica completa e cantores renomados.',
      dateTimestamp: new Date('2024-12-30T20:00:00Z'),
      establishment: { connect: { id: newEstablishment.id } },
      useruid: newOwner.uid,
      photos: ['https://example.com/opera1.jpg', 'https://example.com/opera2.jpg'],
      isActive: true,
    },
    {
      id: 'event-005',
      name: 'Balé Clássico: O Lago dos Cisnes',
      description: 'Apresentação do balé mais famoso do mundo com a companhia de dança nacional.',
      dateTimestamp: new Date('2025-01-05T19:00:00Z'),
      establishment: { connect: { id: newEstablishment.id } },
      useruid: newOwner.uid,
      photos: ['https://example.com/ballet1.jpg'],
      isActive: true,
    },
  ];

  for (const eventData of events) {
    const { establishment, useruid, ...rest } = eventData;
    const event = await prisma.event.create({
      data: {
        ...rest,
        establishment,
        user: { connect: { uid: useruid } },
      },
    });
    console.log(`✅ Evento criado: ${event.name}`);
  }

  console.log('🎉 Todos os dados foram criados com sucesso!');
  console.log('\n📊 Resumo:');
  console.log('- 1 novo usuário PROFESSIONAL_OWNER (Carlos Mendes)');
  console.log('- 1 novo estabelecimento (Teatro Municipal)');
  console.log('- 5 eventos distribuídos:');
  console.log('  • owner-001 (João Silva): 3 eventos');
  console.log('  • owner-002 (Carlos Mendes): 2 eventos');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 