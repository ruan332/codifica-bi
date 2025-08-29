import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AuthService } from '../services/auth';
import type { AuthUser, LoginCredentials } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Verificar usuário atual ao inicializar
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    console.log('[AuthContext] Iniciando verificação de autenticação...');

    // Timeout de segurança para evitar loop infinito
    timeoutRef.current = setTimeout(() => {
      console.warn('[AuthContext] Timeout atingido - forçando fim do loading');
      setLoading(false);
      setUser(null);
    }, 10000); // 10 segundos de timeout

    const initializeAuth = async () => {
      let subscription: any;
      
      try {
        // Primeiro, testar conectividade
        console.log('[AuthContext] Testando conectividade com Supabase...');
        const connectionTest = await AuthService.testConnection();
        
        if (!connectionTest.success) {
          console.error('[AuthContext] Falha na conectividade:', connectionTest);
          // Continuar mesmo com falha de conectividade
        }
        
        console.log('[AuthContext] Chamando AuthService.getCurrentUser()...');
        const currentUser = await AuthService.getCurrentUser();
        console.log('[AuthContext] Resultado do getCurrentUser:', currentUser);
        setUser(currentUser);
        
        // Escutar mudanças na autenticação
        console.log('[AuthContext] Configurando listener de mudanças de autenticação...');
        const authListener = await AuthService.onAuthStateChange((user) => {
          console.log('[AuthContext] Mudança de estado de autenticação:', user);
          setUser(user);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setLoading(false);
        });
        subscription = authListener?.data?.subscription;
        
      } catch (error) {
        console.error('[AuthContext] Erro ao verificar usuário:', error);
        setUser(null);
      } finally {
        console.log('[AuthContext] Finalizando loading...');
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setLoading(false);
      }
      
      return subscription;
    };

    let authSubscription: any;
    initializeAuth().then(sub => {
      authSubscription = sub;
      
      // Verificação periódica e de foco removidas para evitar logout desnecessário
    }).catch(error => {
      console.error('[AuthContext] Erro na inicialização:', error);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setLoading(false);
    });

    return () => {
      console.log('[AuthContext] Limpando recursos...');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Função de login
  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const user = await AuthService.login(credentials);
      setUser(user);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    console.log('[AuthContext] 🚪 Iniciando logout...');
    setLoading(true);
    try {
      console.log('[AuthContext] 📞 Chamando AuthService.logout()...');
      await AuthService.logout();
      console.log('[AuthContext] ✅ AuthService.logout() concluído');
      
      // Aguardar um pouco para o listener processar o evento SIGNED_OUT
      console.log('[AuthContext] ⏳ Aguardando listener processar SIGNED_OUT...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Forçar definição do user como null caso o listener não tenha funcionado
      console.log('[AuthContext] 🔄 Definindo user como null...');
      setUser(null);
      console.log('[AuthContext] ✅ Logout concluído com sucesso');
    } catch (error) {
      console.error('[AuthContext] ❌ Erro ao fazer logout:', error);
      // Mesmo com erro, limpar o usuário
      setUser(null);
      throw error;
    } finally {
      console.log('[AuthContext] 🏁 Finalizando loading do logout...');
      setLoading(false);
    }
  };

  // Verificar se é admin
  const isAdmin = user?.role === 'admin';

  // Verificar se é cliente
  const isClient = user?.role === 'client';

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isClient,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}