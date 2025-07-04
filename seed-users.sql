-- Script para inserir usuários de teste
-- Senha para todos: 12345678 (criptografada com bcrypt)

-- 1. Usuário Master
INSERT INTO users (uid, email, name, password, "isActive", type, "createdAt", "updatedAt") 
VALUES (
    'master-001',
    'master@letsgo.com',
    'Administrador Master',
    '$2b$10$B16ciFIDwlCx9jwgeb4AHOaKUVMnRRipgXnHEt0nxSMP7MfNB89zi',
    true,
    'MASTER',
    NOW(),
    NOW()
);

-- 2. Usuários Professional (Criadores de Eventos)
INSERT INTO users (uid, email, name, password, "isActive", type, "createdAt", "updatedAt") 
VALUES 
    ('prof-001', 'joao@eventos.com', 'João Silva - Produtor', '$2b$10$B16ciFIDwlCx9jwgeb4AHOaKUVMnRRipgXnHEt0nxSMP7MfNB89zi', true, 'PROFESSIONAL', NOW(), NOW()),
    ('prof-002', 'maria@eventos.com', 'Maria Santos - Organizadora', '$2b$10$B16ciFIDwlCx9jwgeb4AHOaKUVMnRRipgXnHEt0nxSMP7MfNB89zi', true, 'PROFESSIONAL', NOW(), NOW()),
    ('prof-003', 'carlos@eventos.com', 'Carlos Oliveira - Promoter', '$2b$10$B16ciFIDwlCx9jwgeb4AHOaKUVMnRRipgXnHEt0nxSMP7MfNB89zi', true, 'PROFESSIONAL', NOW(), NOW());

-- 3. Usuários Personal (Comuns)
INSERT INTO users (uid, email, name, password, "isActive", type, "createdAt", "updatedAt") 
VALUES 
    ('user-001', 'ana@email.com', 'Ana Costa', '$2b$10$B16ciFIDwlCx9jwgeb4AHOaKUVMnRRipgXnHEt0nxSMP7MfNB89zi', true, 'PERSONAL', NOW(), NOW()),
    ('user-002', 'pedro@email.com', 'Pedro Lima', '$2b$10$B16ciFIDwlCx9jwgeb4AHOaKUVMnRRipgXnHEt0nxSMP7MfNB89zi', true, 'PERSONAL', NOW(), NOW()),
    ('user-003', 'lucia@email.com', 'Lúcia Ferreira', '$2b$10$B16ciFIDwlCx9jwgeb4AHOaKUVMnRRipgXnHEt0nxSMP7MfNB89zi', true, 'PERSONAL', NOW(), NOW()),
    ('user-004', 'roberto@email.com', 'Roberto Almeida', '$2b$10$B16ciFIDwlCx9jwgeb4AHOaKUVMnRRipgXnHEt0nxSMP7MfNB89zi', true, 'PERSONAL', NOW(), NOW()),
    ('user-005', 'julia@email.com', 'Júlia Rodrigues', '$2b$10$B16ciFIDwlCx9jwgeb4AHOaKUVMnRRipgXnHEt0nxSMP7MfNB89zi', true, 'PERSONAL', NOW(), NOW());

-- 4. Usuários Jurídicos (Dono de Estabelecimentos)
INSERT INTO users (uid, email, name, password, "isActive", type, "isOwnerOfEstablishment", "createdAt", "updatedAt") 
VALUES 
    ('juridico-001', 'bar@centenario.com', 'Bar do Centenário', '$2b$10$B16ciFIDwlCx9jwgeb4AHOaKUVMnRRipgXnHEt0nxSMP7MfNB89zi', true, 'PROFESSIONAL', true, NOW(), NOW()),
    ('juridico-002', 'casa@noturna.com', 'Casa Noturna Eclipse', '$2b$10$B16ciFIDwlCx9jwgeb4AHOaKUVMnRRipgXnHEt0nxSMP7MfNB89zi', true, 'PROFESSIONAL', true, NOW(), NOW()),
    ('juridico-003', 'teatro@arte.com', 'Teatro das Artes', '$2b$10$B16ciFIDwlCx9jwgeb4AHOaKUVMnRRipgXnHEt0nxSMP7MfNB89zi', true, 'PROFESSIONAL', true, NOW(), NOW());

-- 5. Inserir estabelecimentos para os usuários jurídicos
INSERT INTO "Establishment" (id, name, coordinates, address, "userOwnerUid", photos, "createdAt", "updatedAt") 
VALUES 
    (
        'estab-001',
        'Bar do Centenário',
        '{"lat": -23.5505, "lng": -46.6333}',
        'Rua das Flores, 123 - Centro, São Paulo - SP',
        'juridico-001',
        ARRAY['https://example.com/bar1.jpg'],
        NOW(),
        NOW()
    ),
    (
        'estab-002',
        'Casa Noturna Eclipse',
        '{"lat": -23.5605, "lng": -46.6433}',
        'Av. Paulista, 456 - Bela Vista, São Paulo - SP',
        'juridico-002',
        ARRAY['https://example.com/casa1.jpg'],
        NOW(),
        NOW()
    ),
    (
        'estab-003',
        'Teatro das Artes',
        '{"lat": -23.5705, "lng": -46.6533}',
        'Rua Augusta, 789 - Consolação, São Paulo - SP',
        'juridico-003',
        ARRAY['https://example.com/teatro1.jpg'],
        NOW(),
        NOW()
    ); 