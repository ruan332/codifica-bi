import type { AuthUser, LoginCredentials } from '../types';

// Dados mockados para demonstração (usando emails reais do Supabase)
const MOCK_USERS: AuthUser[] = [
  {
    id: 'ee19b3af-fe4c-4f5a-b2c0-a987e273ed25',
    email: 'admin@codifica.com',
    role: 'admin'
  },
  {
    id: 'ed8692e1-6fc9-4403-80a3-c9cbabcacce0',
    email: 'codificatech@gmail.com',
    role: 'client'
  }
];

// Simulação de estado de autenticação
let currentMockUser: AuthUser | null = null;
let authListeners: ((user: AuthUser | null) => void)[] = [];

export class MockAuthService {
  // Login mockado
  static async login(credentials: LoginCredentials): Promise<AuthUser> {
    console.log('[MockAuth] Tentativa de login com:', credentials.email);
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = MOCK_USERS.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('Usuário não encontrado. Use admin@codifica.com ou codificatech@gmail.com');
    }
    
    // Simular verificação de senha (aceita qualquer senha)
    if (!credentials.password) {
      throw new Error('Senha é obrigatória');
    }
    
    currentMockUser = user;
    
    // Notificar listeners
    authListeners.forEach(listener => listener(user));
    
    console.log('[MockAuth] Login bem-sucedido:', user);
    return user;
  }
  
  // Logout mockado
  static async logout(): Promise<void> {
    console.log('[MockAuth] Fazendo logout...');
    currentMockUser = null;
    
    // Notificar listeners
    authListeners.forEach(listener => listener(null));
  }
  
  // Obter usuário atual mockado
  static async getCurrentUser(): Promise<AuthUser | null> {
    console.log('[MockAuth] Obtendo usuário atual:', currentMockUser);
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return currentMockUser;
  }
  
  // Verificar se está autenticado
  static async isAuthenticated(): Promise<boolean> {
    return currentMockUser !== null;
  }
  
  // Listener de mudanças de autenticação mockado
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    console.log('[MockAuth] Registrando listener de mudanças de autenticação');
    
    authListeners.push(callback);
    
    // Retornar objeto compatível com Supabase
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            console.log('[MockAuth] Removendo listener');
            const index = authListeners.indexOf(callback);
            if (index > -1) {
              authListeners.splice(index, 1);
            }
          }
        }
      }
    };
  }
  
  // Testar conectividade (sempre retorna sucesso para mock)
  static async testConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
    console.log('[MockAuth] Testando conectividade (modo demo)');
    return { success: true };
  }
  
  // Resetar para estado inicial
  static reset(): void {
    currentMockUser = null;
    authListeners = [];
  }
}