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

  // Obter usuário atual
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      console.log('[AuthService] Iniciando verificação de usuário atual...');
      
      
      // Timeout para evitar travamento
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na verificação do usuário')), 8000);
      });
      
      const getUserPromise = supabase.auth.getUser();
      
      const { data: { user }, error: authError } = await Promise.race([
        getUserPromise,
        timeoutPromise
      ]);
      
      if (authError) {
        console.error('[AuthService] Erro na autenticação:', authError);
        return null;
      }
      
      if (!user) {
        console.log('[AuthService] Nenhum usuário autenticado encontrado');
        return null;
      }

      console.log('[AuthService] Usuário autenticado encontrado:', user.id);

      // Buscar dados adicionais do usuário na tabela users com retry
      console.log('[AuthService] Buscando dados do usuário na tabela users...');
      
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          let userData = null;
          let error = null;

          // Estratégia 1: Buscar por ID
          console.log('[AuthService] Tentativa 1: Buscar por ID:', user.id);
          const idResult = await supabase
            .from('users')
            .select('id, email, role')
            .eq('id', user.id)
            .single();

          if (!idResult.error && idResult.data) {
            userData = idResult.data;
            console.log('[AuthService] Usuário encontrado por ID:', userData);
          } else {
            console.log('[AuthService] Busca por ID falhou:', idResult.error?.message);
            
            // Estratégia 2: Buscar por email
            console.log('[AuthService] Tentativa 2: Buscar por email:', user.email);
            const emailResult = await supabase
              .from('users')
              .select('id, email, role')
              .eq('email', user.email)
              .single();

            if (!emailResult.error && emailResult.data) {
              userData = emailResult.data;
              console.log('[AuthService] Usuário encontrado por email:', userData);
            } else {
              console.log('[AuthService] Busca por email falhou:', emailResult.error?.message);
              error = emailResult.error;
            }
          }

          if (userData) {
            console.log('[AuthService] Dados do usuário carregados com sucesso:', userData);
            return {
              id: user.id, // Sempre usar o ID do auth.users para consistência
              email: userData.email,
              role: userData.role,
            };
          }

          if (error) {
            console.error(`[AuthService] Erro ao buscar dados do usuário (tentativa ${retryCount + 1}):`, error);
            
            // Códigos de erro que indicam problemas estruturais
            if (error.code === 'PGRST116' || // Tabela não encontrada
                error.code === '42P01' ||   // Tabela não existe
                error.code === '42501') {   // Permissão negada
              console.error('[AuthService] Problema estrutural detectado:', error);
              throw new Error('Erro de configuração do banco de dados');
            }
            
            // Para outros erros, tentar novamente
            if (retryCount < maxRetries) {
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              continue;
            }
            
            return null;
          }

          console.warn('[AuthService] Dados do usuário não encontrados na tabela users');
          return null;
        } catch (queryError) {
          console.error(`[AuthService] Erro na consulta (tentativa ${retryCount + 1}):`, queryError);
          if (retryCount < maxRetries) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          } else {
            throw queryError;
          }
        }
      }
      
      return null;
    } catch (error: any) {
      console.error('[AuthService] Erro inesperado ao obter usuário atual:', error);
      
      // Se houve timeout ou erro crítico, retornar null
      if (error.message?.includes('Timeout') || error.name === 'AbortError') {
        console.error('[AuthService] Timeout detectado:', error);
        return null;
      }
      
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
      
      console.log('[AuthService] Configurando listener do Supabase...');
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
            const user = await this.getCurrentUser();
            console.log('[AuthService] Dados do usuário obtidos:', user);
            callback(user);
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
      // Retornar um objeto para evitar erros
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