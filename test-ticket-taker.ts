import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testTicketTaker() {
  try {
    console.log('🔍 Testando estrutura da tabela TicketTaker...');
    
    // Verificar se a tabela existe e sua estrutura
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'ticket_takers'
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Estrutura da tabela ticket_takers:');
    console.log(tableInfo);
    
    // Verificar constraints
    const constraints = await prisma.$queryRaw`
      SELECT conname, contype, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'ticket_takers'::regclass;
    `;
    
    console.log('🔒 Constraints da tabela:');
    console.log(constraints);
    
    // Testar inserção
    console.log('🧪 Testando inserção...');
    
    // Primeiro, buscar um usuário TICKETTAKER
    const ticketTaker = await prisma.user.findFirst({
      where: { type: 'TICKETTAKER' }
    });
    
    if (!ticketTaker) {
      console.log('❌ Nenhum TICKETTAKER encontrado no sistema');
      return;
    }
    
    console.log('✅ TICKETTAKER encontrado:', ticketTaker.uid);
    
    // Buscar um usuário profissional
    const professional = await prisma.user.findFirst({
      where: { 
        type: { in: ['PROFESSIONAL_OWNER', 'PROFESSIONAL_PROMOTER'] }
      }
    });
    
    if (!professional) {
      console.log('❌ Nenhum profissional encontrado no sistema');
      return;
    }
    
    console.log('✅ Profissional encontrado:', professional.uid);
    
    // Testar criação da associação
    const newLink = await prisma.ticketTaker.create({
      data: {
        userTicketTakerUid: ticketTaker.uid,
        userOwnerUid: professional.uid
      }
    });
    
    console.log('✅ Associação criada com sucesso:', newLink);
    
    // Limpar o teste
    await prisma.ticketTaker.delete({
      where: { id: newLink.id }
    });
    
    console.log('🧹 Teste limpo');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTicketTaker(); 