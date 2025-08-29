import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
// Estas variáveis devem ser configuradas no arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL e ANON_KEY devem ser configurados nas variáveis de ambiente');
}

if (!supabaseServiceKey) {
  console.error('VITE_SUPABASE_SERVICE_ROLE_KEY deve ser configurada para operações administrativas');
}

// Cliente principal para operações normais
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Configurações adicionais para melhor gerenciamento de sessão
    storage: window.localStorage,
    storageKey: 'supabase.auth.token'
  }
});

// Cliente administrativo para operações que requerem service_role
// Verificar se a service_role key está disponível
if (!supabaseServiceKey) {
  throw new Error('VITE_SUPABASE_SERVICE_ROLE_KEY é obrigatória para operações administrativas');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Tipos específicos do Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          role: 'client' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          role?: 'client' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          role?: 'client' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          cnpj: string;
          user_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cnpj: string;
          user_id: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          cnpj?: string;
          user_id?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          title: string;
          description: string;
          power_bi_url: string;
          iframe_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          power_bi_url: string;
          iframe_code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          power_bi_url?: string;
          iframe_code?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      client_reports: {
        Row: {
          id: string;
          client_id: string;
          report_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          report_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          report_id?: string;
          created_at?: string;
        };
      };
      access_logs: {
        Row: {
          id: string;
          user_id: string;
          report_id: string;
          accessed_at: string;
          ip_address: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          report_id: string;
          accessed_at?: string;
          ip_address: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          report_id?: string;
          accessed_at?: string;
          ip_address?: string;
        };
      };
    };
  };
}

// Cliente tipado do Supabase
export type SupabaseClient = typeof supabase;