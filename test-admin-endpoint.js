const axios = require('axios');

async function testAdminEndpoint() {
    try {
        console.log('Testando endpoint admin...');
        
        // Primeiro, vamos fazer login para obter um token
        const loginResponse = await axios.post('http://localhost:3008/user/auth/login', {
            email: 'master@letsgo.com',
            password: '12345678'
        });
        
        const token = loginResponse.data.access_token;
        console.log('Token obtido:', token ? '✅' : '❌');
        
        if (!token) {
            console.log('Não foi possível obter token de acesso');
            return;
        }
        
        // Testar o endpoint que estava com problema
        const adminResponse = await axios.get('http://localhost:3008/admin/users/professionals-detailed', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Endpoint funcionando!');
        console.log('Profissionais encontrados:', adminResponse.data.professionals?.length || 0);
        
        if (adminResponse.data.professionals?.length > 0) {
            console.log('Primeiro profissional:', adminResponse.data.professionals[0].user.name);
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.response?.data || error.message);
    }
}

testAdminEndpoint(); 