-- Script de configuração completa do banco de dados Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- =============================================
-- 1. CRIAÇÃO DAS TABELAS
-- =============================================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relatórios
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  power_bi_url TEXT NOT NULL,
  iframe_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de associação cliente-relatório
CREATE TABLE IF NOT EXISTS client_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, report_id)
);

-- Tabela de logs de acesso
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET
);

-- =============================================
-- 2. CRIAÇÃO DOS ÍNDICES
-- =============================================

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Índices para clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_cnpj ON clients(cnpj);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(is_active);

-- Índices para reports
CREATE INDEX IF NOT EXISTS idx_reports_title ON reports(title);

-- Índices para client_reports
CREATE INDEX IF NOT EXISTS idx_client_reports_client_id ON client_reports(client_id);
CREATE INDEX IF NOT EXISTS idx_client_reports_report_id ON client_reports(report_id);

-- Índices para access_logs
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_report_id ON access_logs(report_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_accessed_at ON access_logs(accessed_at DESC);

-- =============================================
-- 3. CONFIGURAÇÃO DO ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. POLÍTICAS RLS PARA TABELA USERS
-- =============================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Políticas para users
CREATE POLICY "Users can view own data" ON users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own data" ON users 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON users 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- 5. POLÍTICAS RLS PARA TABELA CLIENTS
-- =============================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Clients can view own data" ON clients;
DROP POLICY IF EXISTS "Admins can manage all clients" ON clients;

-- Políticas para clients
CREATE POLICY "Clients can view own data" ON clients 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all clients" ON clients 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- 6. POLÍTICAS RLS PARA TABELA REPORTS
-- =============================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Authenticated users can view reports" ON reports;
DROP POLICY IF EXISTS "Admins can manage reports" ON reports;

-- Políticas para reports
CREATE POLICY "Authenticated users can view reports" ON reports 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage reports" ON reports 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- 7. POLÍTICAS RLS PARA TABELA CLIENT_REPORTS
-- =============================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own client reports" ON client_reports;
DROP POLICY IF EXISTS "Admins can manage all associations" ON client_reports;

-- Políticas para client_reports
CREATE POLICY "Users can view own client reports" ON client_reports 
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all associations" ON client_reports 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- 8. POLÍTICAS RLS PARA TABELA ACCESS_LOGS
-- =============================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own logs" ON access_logs;
DROP POLICY IF EXISTS "Admins can view all logs" ON access_logs;
DROP POLICY IF EXISTS "Authenticated users can insert logs" ON access_logs;

-- Políticas para access_logs
CREATE POLICY "Users can view own logs" ON access_logs 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all logs" ON access_logs 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can insert logs" ON access_logs 
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- =============================================
-- 9. CONFIGURAÇÃO DE PERMISSÕES
-- =============================================

-- Permissões para users
GRANT SELECT, UPDATE ON users TO authenticated;
GRANT ALL PRIVILEGES ON users TO service_role;

-- Permissões para clients
GRANT SELECT, INSERT, UPDATE ON clients TO authenticated;
GRANT ALL PRIVILEGES ON clients TO service_role;

-- Permissões para reports
GRANT SELECT ON reports TO authenticated;
GRANT ALL PRIVILEGES ON reports TO service_role;

-- Permissões para client_reports
GRANT SELECT ON client_reports TO authenticated;
GRANT ALL PRIVILEGES ON client_reports TO service_role;

-- Permissões para access_logs
GRANT SELECT, INSERT ON access_logs TO authenticated;
GRANT ALL PRIVILEGES ON access_logs TO service_role;

-- =============================================
-- 10. DADOS INICIAIS
-- =============================================

-- Inserir usuário administrador padrão na tabela users
-- IMPORTANTE: Este usuário deve ser criado primeiro no Supabase Auth
INSERT INTO users (id, email, password_hash, role) 
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@codifica.com',
  'placeholder_hash', -- Este será substituído pelo Supabase Auth
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Inserir relatório de exemplo
INSERT INTO reports (title, description, power_bi_url, iframe_code)
VALUES (
  'Dashboard SDP Pneus',
  'Relatório de vendas e performance da SDP Pneus',
  'https://app.powerbi.com/view?r=eyJrIjoiNmM3OWMzZjktOTg4Zi00Zjk4LTg4OWUtMTU3MGQxYzBmMTdkIiwidCI6ImI1NzkyZTcyLWM3YzgtNDJjNS1hYTNmLTI0Nzc4NTJhZDVhYyJ9',
  '<iframe title="dash_sdpneus" width="600" height="373.5" src="https://app.powerbi.com/view?r=eyJrIjoiNmM3OWMzZjktOTg4Zi00Zjk4LTg4OWUtMTU3MGQxYzBmMTdkIiwidCI6ImI1NzkyZTcyLWM3YzgtNDJjNS1hYTNmLTI0Nzc4NTJhZDVhYyJ9" frameborder="0" allowFullScreen="true"></iframe>'
) ON CONFLICT DO NOTHING;

-- =============================================
-- 11. FUNÇÕES AUXILIARES
-- =============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SCRIPT CONCLUÍDO
-- =============================================

-- Para verificar se tudo foi criado corretamente, execute:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM users;
-- SELECT * FROM reports;