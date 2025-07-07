import { PrismaClient, UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('🚀 Iniciando criação de usuários de teste...');

    // Hash da senha padrão
    const hashedPassword = await bcrypt.hash('12345678', 10);

    // 1. MASTER USER
    console.log('📋 Criando usuário MASTER...');
    const masterUser = await prisma.user.upsert({
      where: { email: 'master@letsgo.com' },
      update: {},
      create: {
        uid: 'master-001',
        email: 'master@letsgo.com',
        name: 'Administrador Master',
        password: hashedPassword,
        type: UserType.MASTER,
        isActive: true,
        phone: '(11) 99999-9999',
        birthDate: new Date('1985-01-15'),
        document: '123.456.789-00'
      }
    });
    console.log('✅ Usuário MASTER criado:', masterUser.email);

    // 2. PROFESSIONAL_OWNER (Dono de Estabelecimento)
    console.log('📋 Criando usuário PROFESSIONAL_OWNER...');
    const professionalOwner = await prisma.user.upsert({
      where: { email: 'owner@letsgo.com' },
      update: {},
      create: {
        uid: 'owner-001',
        email: 'owner@letsgo.com',
        name: 'João Silva - Dono de Estabelecimento',
        password: hashedPassword,
        type: UserType.PROFESSIONAL_OWNER,
        isActive: true,
        isOwnerOfEstablishment: true,
        phone: '(11) 88888-8888',
        birthDate: new Date('1980-05-20'),
        document: '987.654.321-00',
        stripeAccountId: 'acct_test_owner_001'
      }
    });
    console.log('✅ Usuário PROFESSIONAL_OWNER criado:', professionalOwner.email);

    // 3. PROFESSIONAL_PROMOTER (Promotor de Eventos)
    console.log('📋 Criando usuário PROFESSIONAL_PROMOTER...');
    const professionalPromoter = await prisma.user.upsert({
      where: { email: 'promoter@letsgo.com' },
      update: {},
      create: {
        uid: 'promoter-001',
        email: 'promoter@letsgo.com',
        name: 'Maria Santos - Promotora de Eventos',
        password: hashedPassword,
        type: UserType.PROFESSIONAL_PROMOTER,
        isActive: true,
        phone: '(11) 77777-7777',
        birthDate: new Date('1988-12-10'),
        document: '456.789.123-00',
        stripeAccountId: 'acct_test_promoter_001'
      }
    });
    console.log('✅ Usuário PROFESSIONAL_PROMOTER criado:', professionalPromoter.email);

    // 4. TICKETTAKER (Usuário Administrativo)
    console.log('📋 Criando usuário TICKETTAKER...');
    const ticketTaker = await prisma.user.upsert({
      where: { email: 'taker@letsgo.com' },
      update: {},
      create: {
        uid: 'taker-001',
        email: 'taker@letsgo.com',
        name: 'Pedro Costa - Recepcionista',
        password: hashedPassword,
        type: UserType.TICKETTAKER,
        isActive: true,
        phone: '(11) 66666-6666',
        birthDate: new Date('1990-08-25'),
        document: '789.123.456-00'
      }
    });
    console.log('✅ Usuário TICKETTAKER criado:', ticketTaker.email);

    // 5. PERSONAL (Usuário Comum)
    console.log('📋 Criando usuário PERSONAL...');
    const personalUser = await prisma.user.upsert({
      where: { email: 'user@letsgo.com' },
      update: {},
      create: {
        uid: 'personal-001',
        email: 'user@letsgo.com',
        name: 'Ana Oliveira - Usuária Comum',
        password: hashedPassword,
        type: UserType.PERSONAL,
        isActive: true,
        phone: '(11) 55555-5555',
        birthDate: new Date('1995-03-15'),
        document: '321.654.987-00',
        stripeCustomerId: 'cus_test_personal_001'
      }
    });
    console.log('✅ Usuário PERSONAL criado:', personalUser.email);

    // 6. Criar Estabelecimento para o PROFESSIONAL_OWNER
    console.log('📋 Criando estabelecimento para o PROFESSIONAL_OWNER...');
    const establishment = await prisma.establishment.upsert({
      where: { id: 'estab-001' },
      update: {},
      create: {
        id: 'estab-001',
        name: 'Casa de Shows ABC',
        address: 'Rua das Flores, 123 - São Paulo, SP',
        coordinates: { latitude: -23.5505, longitude: -46.6333 },
        userOwnerUid: professionalOwner.uid,
        photos: [
          'https://example.com/photo1.jpg',
          'https://example.com/photo2.jpg'
        ],
        description: 'Uma das melhores casas de shows de São Paulo, com capacidade para 500 pessoas e excelente infraestrutura.',
        contactPhone: '(11) 3333-4444',
        website: 'https://casashowsabc.com.br',
        socialMedia: {
          instagram: '@casashowsabc',
          facebook: 'Casa de Shows ABC',
          twitter: '@casashowsabc'
        }
      }
    });
    console.log('✅ Estabelecimento criado:', establishment.name);

    // 7. Criar Evento para teste
    console.log('📋 Criando evento de teste...');
    const event = await prisma.event.upsert({
      where: { id: 'event-001' },
      update: {},
      create: {
        id: 'event-001',
        name: 'Show de Rock - Banda XYZ',
        description: 'Uma noite incrível com a melhor banda de rock da cidade!',
        dateTimestamp: new Date('2024-12-31T20:00:00Z'),
        useruid: professionalOwner.uid,
        establishmentId: establishment.id,
        isActive: true,
        photos: [
          'https://example.com/event1.jpg',
          'https://example.com/event2.jpg'
        ],
        ticketTakers: [ticketTaker.email],
        listNames: ['Lista VIP', 'Lista Geral']
      }
    });
    console.log('✅ Evento criado:', event.name);

    // 8. Criar Ticket para o evento
    console.log('📋 Criando ticket para o evento...');
    const ticket = await prisma.ticket.upsert({
      where: { id: 'ticket-001' },
      update: {},
      create: {
        id: 'ticket-001',
        description: 'Ingresso Geral',
        price: 50.00,
        eventId: event.id,
        quantity_available: 100
      }
    });
    console.log('✅ Ticket criado:', ticket.description);

    // 9. Criar Cupom de desconto
    console.log('📋 Criando cupom de desconto...');
    const cupom = await prisma.cupom.upsert({
      where: { id: 'cupom-001' },
      update: {},
      create: {
        id: 'cupom-001',
        code: 'DESCONTO10',
        eventId: event.id,
        quantity_available: 50,
        descont_percent: 10.00,
        expiresAt: new Date('2024-12-30T23:59:59Z')
      }
    });
    console.log('✅ Cupom criado:', cupom.code);

    // 10. Vincular cupom ao ticket
    console.log('📋 Vinculando cupom ao ticket...');
    await prisma.ticketCupons.upsert({
      where: { id: 'ticket-cupom-001' },
      update: {},
      create: {
        id: 'ticket-cupom-001',
        ticketId: ticket.id,
        cupomId: cupom.id
      }
    });
    console.log('✅ Cupom vinculado ao ticket');

    // 11. Criar EventManager para o PROFESSIONAL_PROMOTER
    console.log('📋 Criando EventManager para o PROFESSIONAL_PROMOTER...');
    const eventManager = await prisma.eventsReceptionist.upsert({
      where: { id: 'manager-001' },
      update: {},
      create: {
        id: 'manager-001',
        useruid: professionalPromoter.uid,
        eventId: event.id,
        recursos: ['EVENTUPDATE', 'TICKETINSERT', 'CUPOMINSERT']
      }
    });
    console.log('✅ EventManager criado');

    // 12. Criar TicketTaker vinculado ao PROFESSIONAL_OWNER
    console.log('📋 Criando TicketTaker vinculado...');
    await prisma.ticketTaker.upsert({
      where: { id: 'ticket-taker-001' },
      update: {},
      create: {
        id: 'ticket-taker-001',
        userOwnerUid: professionalOwner.uid,
        userTicketTakerUid: ticketTaker.uid
      }
    });
    console.log('✅ TicketTaker vinculado');

    console.log('\n🎉 Todos os usuários de teste foram criados com sucesso!');
    console.log('\n📋 Resumo dos usuários criados:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 MASTER:');
    console.log('   Email: master@letsgo.com');
    console.log('   Senha: 12345678');
    console.log('   Dashboard: /dashboard/master');
    console.log('');
    console.log('🏢 PROFESSIONAL_OWNER:');
    console.log('   Email: owner@letsgo.com');
    console.log('   Senha: 12345678');
    console.log('   Dashboard: /dashboard');
    console.log('');
    console.log('🎪 PROFESSIONAL_PROMOTER:');
    console.log('   Email: promoter@letsgo.com');
    console.log('   Senha: 12345678');
    console.log('   Dashboard: /dashboard');
    console.log('');
    console.log('🎫 TICKETTAKER:');
    console.log('   Email: taker@letsgo.com');
    console.log('   Senha: 12345678');
    console.log('   Funcionalidade: Validação de QR Codes');
    console.log('');
    console.log('👤 PERSONAL:');
    console.log('   Email: user@letsgo.com');
    console.log('   Senha: 12345678');
    console.log('   Funcionalidade: App Mobile');
    console.log('');
    console.log('🏢 Estabelecimento criado: Casa de Shows ABC');
    console.log('🎭 Evento criado: Show de Rock - Banda XYZ');
    console.log('🎫 Ticket criado: Ingresso Geral - R$ 50,00');
    console.log('🎟️ Cupom criado: DESCONTO10 (10% de desconto)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
