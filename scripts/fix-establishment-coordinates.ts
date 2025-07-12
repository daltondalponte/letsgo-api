import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEstablishmentCoordinates() {
    console.log('🔧 Iniciando correção das coordenadas dos estabelecimentos...');
    
    try {
        // Buscar todos os estabelecimentos
        const establishments = await prisma.establishment.findMany({
            select: {
                id: true,
                name: true,
                coordinates: true
            }
        });
        
        console.log(`📊 Encontrados ${establishments.length} estabelecimentos`);
        
        let fixedCount = 0;
        let errorCount = 0;
        
        for (const establishment of establishments) {
            try {
                console.log(`\n🔍 Verificando estabelecimento: ${establishment.name}`);
                console.log(`Coordenadas atuais: ${establishment.coordinates}`);
                
                if (!establishment.coordinates) {
                    console.log('❌ Estabelecimento sem coordenadas - pulando...');
                    continue;
                }
                
                let coordinates;
                
                // Tentar fazer parse das coordenadas
                if (typeof establishment.coordinates === 'string') {
                    try {
                        coordinates = JSON.parse(establishment.coordinates);
                        console.log('✅ Coordenadas já estão em formato JSON válido');
                        continue;
                    } catch (error) {
                        console.log('❌ Erro ao fazer parse das coordenadas:', error.message);
                        
                        // Tentar extrair coordenadas de diferentes formatos
                        const coordStr = establishment.coordinates.toString();
                        
                        // Procurar por padrões de coordenadas
                        const latMatch = coordStr.match(/lat[itude]*[:\s]*([-\d.]+)/i);
                        const lngMatch = coordStr.match(/lng[itude]*[:\s]*([-\d.]+)/i);
                        
                        if (latMatch && lngMatch) {
                            const latitude = parseFloat(latMatch[1]);
                            const longitude = parseFloat(lngMatch[1]);
                            
                            if (!isNaN(latitude) && !isNaN(longitude)) {
                                coordinates = { latitude, longitude };
                                console.log('✅ Coordenadas extraídas:', coordinates);
                            } else {
                                console.log('❌ Coordenadas extraídas são inválidas');
                                errorCount++;
                                continue;
                            }
                        } else {
                            console.log('❌ Não foi possível extrair coordenadas válidas');
                            errorCount++;
                            continue;
                        }
                    }
                } else if (typeof establishment.coordinates === 'object') {
                    coordinates = establishment.coordinates;
                    console.log('✅ Coordenadas já são um objeto válido');
                    continue;
                } else {
                    console.log('❌ Formato de coordenadas desconhecido');
                    errorCount++;
                    continue;
                }
                
                // Atualizar as coordenadas no banco
                const updatedCoordinates = JSON.stringify(coordinates);
                await prisma.establishment.update({
                    where: { id: establishment.id },
                    data: { coordinates: updatedCoordinates }
                });
                
                console.log('✅ Estabelecimento atualizado com sucesso');
                fixedCount++;
                
            } catch (error) {
                console.log(`❌ Erro ao processar estabelecimento ${establishment.name}:`, error.message);
                errorCount++;
            }
        }
        
        console.log(`\n📊 Resumo da correção:`);
        console.log(`✅ Estabelecimentos corrigidos: ${fixedCount}`);
        console.log(`❌ Erros encontrados: ${errorCount}`);
        console.log(`📊 Total processado: ${establishments.length}`);
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar o script
fixEstablishmentCoordinates()
    .then(() => {
        console.log('🎉 Script de correção concluído!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Erro fatal:', error);
        process.exit(1);
    }); 