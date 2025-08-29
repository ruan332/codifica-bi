# Codifica Analytics

**Inteligência em dados, resultados em ação**

Sistema de Business Intelligence para visualização e análise de relatórios Power BI com autenticação segura e controle de acesso baseado em funções.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API e Banco de Dados](#api-e-banco-de-dados)
- [Deploy](#deploy)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🚀 Sobre o Projeto

O Codifica Analytics é uma plataforma web moderna para visualização de relatórios Power BI, desenvolvida com React, TypeScript e Supabase. O sistema oferece autenticação segura, controle de acesso baseado em funções (admin/cliente) e interface responsiva para uma experiência otimizada em diferentes dispositivos.

### Principais Características

- **Interface Moderna**: Design clean e responsivo com Tailwind CSS
- **Autenticação Segura**: Sistema completo de login/logout com Supabase Auth
- **Controle de Acesso**: Diferentes níveis de permissão (admin/cliente)
- **Visualização de Relatórios**: Integração nativa com Power BI
- **Gestão de Usuários**: Painel administrativo para gerenciar usuários e relatórios
- **Experiência Otimizada**: Interface otimizada para visualização de dashboards

## ✨ Funcionalidades

### Para Clientes
- ✅ Login seguro com email/senha
- ✅ Dashboard personalizado com relatórios disponíveis
- ✅ Visualização de relatórios Power BI em tela cheia
- ✅ Busca e filtros de relatórios
- ✅ Interface responsiva para desktop e mobile

### Para Administradores
- ✅ Painel administrativo completo
- ✅ Gestão de usuários (criar, editar, desativar)
- ✅ Gestão de relatórios (adicionar, editar, remover)
- ✅ Controle de acesso aos relatórios
- ✅ Logs de acesso e auditoria

## 🛠 Tecnologias

### Frontend
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool e dev server ultra-rápido
- **Tailwind CSS** - Framework CSS utilitário
- **React Router DOM** - Roteamento para aplicações React
- **Lucide React** - Ícones modernos e customizáveis

### Backend & Infraestrutura
- **Supabase** - Backend-as-a-Service (BaaS)
  - PostgreSQL Database
  - Authentication
  - Real-time subscriptions
  - Row Level Security (RLS)
- **Vercel** - Plataforma de deploy e hospedagem

### Ferramentas de Desenvolvimento
- **ESLint** - Linting e qualidade de código
- **PostCSS** - Processamento de CSS
- **Autoprefixer** - Prefixos CSS automáticos

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Supabase
- Relatórios Power BI (opcional, para testes)

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd codifica-bi
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

4. **Configure o Supabase** (veja seção [Configuração](#configuração))

5. **Execute o projeto**
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## ⚙️ Configuração

### 1. Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script SQL de configuração:

```sql
-- Execute o conteúdo do arquivo supabase-setup.sql
-- Isso criará as tabelas necessárias e configurará RLS
```

3. Configure as variáveis de ambiente no arquivo `.env`:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
```

### 2. Configuração de Relatórios Power BI

1. No Power BI, publique seus relatórios
2. Obtenha o código de incorporação (embed)
3. No painel admin, adicione os relatórios com:
   - Título e descrição
   - Código iframe do Power BI
   - URL direta (opcional)

### 3. Usuários Iniciais

Execute o script para criar usuários iniciais:

```sql
-- Criar usuário administrador
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@codifica.com',
  crypt('senha123', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

## 📖 Uso

### Acesso ao Sistema

1. **Login**: Acesse a página inicial e faça login com suas credenciais
2. **Dashboard**: Visualize os relatórios disponíveis para seu perfil
3. **Relatórios**: Clique em um relatório para visualizá-lo em tela cheia

### Administração

1. **Painel Admin**: Usuários admin têm acesso ao painel de administração
2. **Gestão de Usuários**: Criar, editar e gerenciar usuários do sistema
3. **Gestão de Relatórios**: Adicionar novos relatórios e gerenciar permissões
4. **Controle de Acesso**: Definir quais usuários têm acesso a quais relatórios

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Alert.tsx       # Sistema de alertas
│   ├── Button.tsx      # Botões personalizados
│   ├── Card.tsx        # Cards e containers
│   ├── Header.tsx      # Cabeçalho da aplicação
│   ├── Input.tsx       # Campos de entrada
│   └── ...
├── contexts/           # Contextos React
│   └── AuthContext.tsx # Contexto de autenticação
├── hooks/              # Custom hooks
│   ├── useAuth.ts      # Hook de autenticação
│   ├── useAlert.ts     # Hook de alertas
│   └── useReports.ts   # Hook de relatórios
├── pages/              # Páginas da aplicação
│   ├── Login.tsx       # Página de login
│   ├── Dashboard.tsx   # Dashboard do cliente
│   ├── AdminDashboard.tsx # Dashboard administrativo
│   ├── ReportView.tsx  # Visualização de relatórios
│   └── ...
├── services/           # Serviços e APIs
│   ├── auth.ts         # Serviços de autenticação
│   ├── reports.ts      # Serviços de relatórios
│   └── users.ts        # Serviços de usuários
├── types/              # Definições de tipos TypeScript
└── utils/              # Utilitários e helpers
```

## 🗄️ API e Banco de Dados

### Tabelas Principais

- **users**: Informações dos usuários e perfis
- **reports**: Relatórios Power BI disponíveis
- **user_reports**: Relacionamento usuário-relatório (permissões)
- **report_access_logs**: Logs de acesso aos relatórios

### Políticas de Segurança (RLS)

O sistema utiliza Row Level Security do PostgreSQL para garantir que:
- Usuários só acessem seus próprios dados
- Admins tenham acesso completo
- Relatórios sejam visíveis apenas para usuários autorizados

## 🚀 Deploy

### Deploy na Vercel

1. **Conecte o repositório** à Vercel
2. **Configure as variáveis de ambiente** no painel da Vercel
3. **Deploy automático** será realizado a cada push

### Variáveis de Ambiente para Produção

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema:

- 📧 Email: suporte@codifica.com
- 📱 WhatsApp: +55 (11) 99999-9999
- 🌐 Website: [www.codifica.com](https://www.codifica.com)

---

**© 2025 Codifica Analytics. Todos os direitos reservados.**
