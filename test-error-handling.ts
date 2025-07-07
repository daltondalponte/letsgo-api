import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testErrorHandling() {
  try {
    console.log('🧪 Testando tratamento de erros de constraint única...');
    
    // Buscar um estabelecimento existente
    const establishment = await prisma.establishment.findFirst();
    if (!establishment) {
      console.log('❌ Nenhum estabelecimento encontrado para teste');
      return;
    }
    
    console.log(`📍 Usando estabelecimento: ${establishment.name}`);
    
    // Buscar um usuário existente
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('❌ Nenhum usuário encontrado para teste');
      return;
    }
    
    console.log(`👤 Usando usuário: ${user.name} (${user.uid})`);
    
    // Data de teste (futura)
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 7); // 7 dias no futuro
    testDate.setHours(20, 0, 0, 0); // 20:00
    
    console.log(`📅 Data de teste: ${testDate.toLocaleString('pt-BR')}`);
    
    // Tentar criar primeiro evento
    console.log('📝 Criando primeiro evento...');
    const event1 = await prisma.event.create({
      data: {
        name: 'Evento Teste 1',
        description: 'Primeiro evento para teste de constraint',
        dateTimestamp: testDate,
        establishmentId: establishment.id,
        useruid: user.uid,
        photos: [],
        isActive: true
      }
    });
    console.log('✅ Primeiro evento criado com sucesso');
    
    // Tentar criar segundo evento no mesmo horário (deve falhar)
    console.log('📝 Tentando criar segundo evento no mesmo horário...');
    try {
      const event2 = await prisma.event.create({
        data: {
          name: 'Evento Teste 2',
          description: 'Segundo evento para teste de constraint',
          dateTimestamp: testDate, // Mesmo horário
          establishmentId: establishment.id,
          useruid: user.uid,
          photos: [],
          isActive: true
        }
      });
      console.log('❌ ERRO: Segundo evento foi criado quando deveria falhar');
    } catch (error: any) {
      console.log('✅ Constraint funcionando corretamente!');
      console.log(`📋 Código do erro: ${error.code}`);
      console.log(`📋 Mensagem: ${error.message}`);
      
      if (error.code === 'P2002') {
        console.log('🎯 Erro de constraint única detectado corretamente');
      }
    }
    
    // Criar evento em horário diferente (deve funcionar)
    const differentDate = new Date(testDate);
    differentDate.setHours(22, 0, 0, 0); // 22:00
    
    console.log('📝 Criando evento em horário diferente...');
    const event3 = await prisma.event.create({
      data: {
        name: 'Evento Teste 3',
        description: 'Evento em horário diferente',
        dateTimestamp: differentDate,
        establishmentId: establishment.id,
        useruid: user.uid,
        photos: [],
        isActive: true
      }
    });
    console.log('✅ Evento em horário diferente criado com sucesso');
    
    // Limpar dados de teste
    console.log('🧹 Limpando dados de teste...');
    await prisma.event.deleteMany({
      where: {
        name: {
          startsWith: 'Evento Teste'
        }
      }
    });
    console.log('✅ Dados de teste removidos');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testErrorHandling(); 