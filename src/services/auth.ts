import { supabase, supabaseAdmin } from '../lib/supabase';
import type { LoginCredentials, AuthUser } from '../types';

export class AuthService {
  // Login do usuário
  static async login(credentials: LoginCredentials): Promise<AuthUser> {
    console.log('[AuthService] Fazendo login com Supabase...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Usuário não encontrado');
    }

    // Buscar dados adicionais do usuário na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      throw new Error('Erro ao buscar dados do usuário');
    }

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    };
  }

  // Logout do usuário
  static async logout(): Promise<void> {
    console.log('[AuthService] Iniciando processo de logout...');
    
    console.log('[AuthService] Chamando supabase.auth.signOut()...');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('[AuthService] Erro no signOut:', error);
      throw new Error(error.message);
    }
    
    console.log('[AuthService] Logout do Supabase concluído com sucesso');
  }

  // Obter usuário atual - VERSÃO COMPLETAMENTE NOVA
  static async getCurrentUser(): Promise<AuthUser | null> {
    console.log('[AuthService] VERSÃO FINAL - Iniciando verificação de usuário atual...');
    
    try {
      // Obter sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('[AuthService] Nenhuma sessão ativa encontrada');
        return null;
      }
      
      console.log('[AuthService] Usuário da sessão encontrado:', session.user.id);

      // Buscar dados do usuário na tabela users
      const { data: userData } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', session.user.id)
        .single();

      if (!userData) {
        console.warn('[AuthService] Dados do usuário não encontrados na tabela users');
        return null;
      }

      console.log('[AuthService] Dados do usuário carregados com sucesso:', userData);
      return {
        id: session.user.id,
        email: userData.email,
        role: userData.role,
      };
    } catch (error: any) {
      console.error('[AuthService] Erro inesperado ao obter usuário atual:', error);
      return null;
    }
  }

  // Verificar se o usuário está autenticado
  static async isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  }

  // Criar novo usuário (apenas para admins)
  static async createUser(email: string, password: string, role: 'client' | 'admin' = 'client'): Promise<AuthUser> {
    console.log('[AuthService] Iniciando criação de usuário:', { email, role });
    
    // Verificar se a service_role key está configurada
    const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      console.error('[AuthService] VITE_SUPABASE_SERVICE_ROLE_KEY não configurada');
      throw new Error('Service role key não configurada. Verifique as variáveis de ambiente.');
    }
    
    console.log('[AuthService] Service key configurada:', serviceKey.substring(0, 20) + '...');
    
    // Primeiro, criar o usuário no auth usando admin API
    console.log('[AuthService] Chamando supabaseAdmin.auth.admin.createUser...');
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automaticamente
    });

    if (error) {
      console.error('[AuthService] Erro ao criar usuário:', {
        message: error.message,
        status: error.status,
        code: error.code || 'N/A',
        details: error
      });
      throw new Error(`Erro ao criar usuário: ${error.message} (Status: ${error.status})`);
    }

    if (!data.user) {
      console.error('[AuthService] Usuário não retornado na resposta:', data);
      throw new Error('Erro ao criar usuário: dados do usuário não retornados');
    }
    
    console.log('[AuthService] Usuário criado com sucesso no auth:', data.user.id);

    // Verificar se o usuário já existe na tabela public.users
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', data.user.id)
      .single();

    if (existingUser) {
      // Usuário já existe, retornar os dados existentes
      return {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      };
    }

    // Usuário não existe, inserir na tabela users com o role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email,
        role,
        password_hash: '', // O hash será gerenciado pelo Supabase Auth
      })
      .select()
      .single();

    if (userError) {
      // Se ainda houver erro de chave duplicada, tentar buscar o usuário existente
      if (userError.code === '23505') {
        const { data: fallbackUser } = await supabase
          .from('users')
          .select('id, email, role')
          .eq('id', data.user.id)
          .single();
        
        if (fallbackUser) {
          return {
            id: fallbackUser.id,
            email: fallbackUser.email,
            role: fallbackUser.role,
          };
        }
      }
      throw new Error(`Erro ao salvar dados do usuário: ${userError.message}`);
    }

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    };
  }

  // Escutar mudanças na autenticação
  static async onAuthStateChange(callback: (user: AuthUser | null) => void) {
    try {
      console.log('[AuthService] Configurando listener de mudanças de autenticação...');
      
      return supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          console.log('[AuthService] 🔔 Evento de autenticação recebido:', event);
          console.log('[AuthService] 📋 Sessão:', session ? `Usuário: ${session.user?.email}` : 'Nenhuma sessão');
          
          if (event === 'SIGNED_OUT') {
            console.log('[AuthService] ✅ Evento SIGNED_OUT detectado - chamando callback com null');
            callback(null);
            return;
          }
          
          if (session?.user) {
            console.log('[AuthService] Sessão ativa, buscando dados do usuário...');
            
            // Buscar dados do usuário diretamente
            try {
              const { data: userData } = await supabase
                .from('users')
                .select('id, email, role')
                .eq('id', session.user.id)
                .single();

              if (userData) {
                console.log('[AuthService] Dados do usuário obtidos:', userData);
                callback({
                  id: session.user.id,
                  email: userData.email,
                  role: userData.role,
                });
                return;
              }
            } catch (error) {
              console.error('[AuthService] Erro ao buscar dados do usuário:', error);
            }
            
            console.log('[AuthService] Não foi possível obter dados do usuário');
            callback(null);
          } else {
            console.log('[AuthService] Nenhuma sessão ativa, retornando null');
            callback(null);
          }
        } catch (error) {
          console.error('[AuthService] Erro no callback de mudança de autenticação:', error);
          callback(null);
        }
      });
    } catch (error) {
      console.error('[AuthService] Erro ao configurar listener de autenticação:', error);
      return {
        data: {
          subscription: {
            unsubscribe: () => console.log('[AuthService] Unsubscribe chamado')
          }
        }
      };
    }
  }

  // Resetar senha
  static async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  // Atualizar senha
  static async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  // Testar conectividade com Supabase
  static async testConnection(): Promise<{ success: boolean; error?: string; details?: any; recommendations?: string[] }> {
    try {
      console.log('[AuthService] Testando conectividade com Supabase...');
      
      // Verificar variáveis de ambiente primeiro
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        return {
          success: false,
          error: 'Variáveis de ambiente não configuradas',
          recommendations: [
            'Configure VITE_SUPABASE_URL no arquivo .env',
            'Configure VITE_SUPABASE_ANON_KEY no arquivo .env',
            'Reinicie o servidor de desenvolvimento após configurar'
          ]
        };
      }
      
      // Teste simples de conectividade
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[AuthService] Erro na conectividade:', error);
        return {
          success: false,
          error: error.message,
          details: error,
          recommendations: [
            'Verifique se o projeto Supabase está ativo',
            'Confirme se as chaves de API estão corretas',
            'Verifique a conectividade com a internet'
          ]
        };
      }
      
      console.log('[AuthService] Conectividade OK');
      return { 
        success: true,
        recommendations: [
          'Conexão estabelecida com sucesso',
          'Todas as operações do Supabase devem funcionar normalmente'
        ]
      };
    } catch (error: any) {
      console.error('[AuthService] Erro inesperado na conectividade:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido',
        details: error,
        recommendations: [
          'Verifique os logs do console para mais detalhes',
          'Confirme se todas as dependências estão instaladas',
          'Reinicie o servidor de desenvolvimento'
        ]
      };
    }
  }
}
