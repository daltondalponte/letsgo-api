const axios = require('axios');

const API_BASE_URL = 'http://localhost:3008';

async function testEstablishments() {
  try {
    console.log('🔍 Testando endpoint de estabelecimentos...');
    
    // Testar endpoint geral
    const response = await axios.get(`${API_BASE_URL}/establishment/`);
    console.log('✅ Endpoint /establishment/ funcionando');
    console.log('📊 Total de estabelecimentos:', response.data.establishments?.length || 0);
    
    if (response.data.establishments && response.data.establishments.length > 0) {
      console.log('📍 Primeiro estabelecimento:');
      console.log('   Nome:', response.data.establishments[0].name);
      console.log('   Coordenadas:', response.data.establishments[0].coordinates);
    }
    
    // Testar endpoint do mapa
    const mapResponse = await axios.get(`${API_BASE_URL}/establishment/map`);
    console.log('✅ Endpoint /establishment/map funcionando');
    console.log('📊 Estabelecimentos com coordenadas válidas:', mapResponse.data.establishments?.length || 0);
    
  } catch (error) {
    console.error('❌ Erro ao testar endpoints:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
}

testEstablishments(); 