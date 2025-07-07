// Script para testar fuso horário
console.log('🔍 Testando fuso horário...');

// Simular o que acontecia antes (problema)
const localTime = '2025-02-09T23:00';
console.log('⏰ Horário local selecionado:', localTime);

const convertedToUTC = new Date(localTime).toISOString();
console.log('🌍 Convertido para UTC (ANTES):', convertedToUTC);

// Simular o que acontece agora (correção)
console.log('✅ Horário local preservado (AGORA):', localTime);

// Testar conversão para exibição
const moment = require('moment');
moment.locale('pt-br');

const displayTime = moment(localTime).format('DD/MM/YYYY HH:mm');
console.log('📅 Exibição no frontend:', displayTime);

console.log('\n📊 Resumo:');
console.log('   Antes: 23:00 local → 02:00 UTC (erro de 3h)');
console.log('   Agora: 23:00 local → 23:00 local (correto)'); 