import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listarTicketTakersEventos() {
  const eventos = await prisma.event.findMany({
    select: {
      id: true,
      name: true,
      ticketTakers: true
    }
  });
  eventos.forEach(ev => {
    console.log(ev.id, ev.name, ev.ticketTakers);
  });
  await prisma.$disconnect();
}
listarTicketTakersEventos(); 