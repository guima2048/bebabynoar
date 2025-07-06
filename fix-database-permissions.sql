-- Script para corrigir permissões do banco de dados
-- Execute este script como superusuário (postgres)

-- 1. Conectar ao banco postgres
\c postgres;

-- 2. Remover usuário e banco se existirem
DROP DATABASE IF EXISTS bebaby_db;
DROP USER IF EXISTS bebaby_user;

-- 3. Criar usuário com senha simples
CREATE USER bebaby_user WITH PASSWORD 'bebaby123';

-- 4. Criar banco de dados
CREATE DATABASE bebaby_db;

-- 5. Definir o owner do banco
ALTER DATABASE bebaby_db OWNER TO bebaby_user;

-- 6. Conectar ao banco bebaby_db
\c bebaby_db;

-- 7. Dar todas as permissões ao usuário
GRANT ALL PRIVILEGES ON DATABASE bebaby_db TO bebaby_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO bebaby_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bebaby_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bebaby_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO bebaby_user;

-- 8. Definir permissões padrão para futuras tabelas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bebaby_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bebaby_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO bebaby_user;

-- 9. Verificar se tudo está correto
\du bebaby_user;
\l bebaby_db; 