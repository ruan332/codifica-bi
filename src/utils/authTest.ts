/**
 * Utilitário para testar a funcionalidade de autenticação
 * Este arquivo pode ser usado para verificar se o sistema de autenticação está funcionando corretamente
 */

import { AuthService } from '../services/auth';
import { MockAuthService } from '../services/mockAuth';
import type { LoginCredentials } from '../types';

// Credenciais de teste válidas (usando emails reais do Supabase)
const TEST_CREDENTIALS: LoginCredentials[] = [
  { email: 'admin@codifica.com', password: 'admin123' },
  { email: 'codificatech@gmail.com', password: 'client123' }
];

/**
 * Testa o login com credenciais válidas
 */
export async function testValidLogin(): Promise<{ success: boolean; results: any[] }> {
  console.log('[AuthTest] Iniciando teste de login válido...');
  const results = [];
  
  for (const credentials of TEST_CREDENTIALS) {
    try {
      console.log(`[AuthTest] Testando login com ${credentials.email}...`);
      
      const user = await AuthService.login(credentials);
      
      if (user && user.email === credentials.email) {
        console.log(`[AuthTest] ✅ Login bem-sucedido para ${credentials.email}`);
        results.push({
          email: credentials.email,
          success: true,
          user: user
        });
        
        // Fazer logout para limpar o estado
        await AuthService.logout();
      } else {
        console.log(`[AuthTest] ❌ Login falhou para ${credentials.email} - usuário inválido`);
        results.push({
          email: credentials.email,
          success: false,
          error: 'Usuário inválido retornado'
        });
      }
    } catch (error) {
      console.log(`[AuthTest] ❌ Login falhou para ${credentials.email}:`, error);
      results.push({
        email: credentials.email,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
  
  const allSuccess = results.every(r => r.success);
  console.log(`[AuthTest] Resultado final: ${allSuccess ? '✅ TODOS OS TESTES PASSARAM' : '❌ ALGUNS TESTES FALHARAM'}`);
  
  return { success: allSuccess, results };
}

/**
 * Testa o login com credenciais inválidas
 */
export async function testInvalidLogin(): Promise<{ success: boolean; results: any[] }> {
  console.log('[AuthTest] Iniciando teste de login inválido...');
  const results = [];
  
  const invalidCredentials = [
    { email: 'inexistente@demo.com', password: 'qualquer' },
    { email: 'admin@demo.com', password: '' },
    { email: '', password: 'senha' }
  ];
  
  for (const credentials of invalidCredentials) {
    try {
      console.log(`[AuthTest] Testando login inválido com ${credentials.email}...`);
      
      const user = await AuthService.login(credentials);
      
      // Se chegou aqui, o login não deveria ter funcionado
      console.log(`[AuthTest] ❌ Login inválido passou quando deveria falhar: ${credentials.email}`);
      results.push({
        email: credentials.email,
        success: false,
        error: 'Login inválido passou quando deveria falhar'
      });
    } catch (error) {
      // Esperado que falhe
      console.log(`[AuthTest] ✅ Login inválido falhou como esperado para ${credentials.email}`);
      results.push({
        email: credentials.email,
        success: true,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
  
  const allSuccess = results.every(r => r.success);
  console.log(`[AuthTest] Resultado final: ${allSuccess ? '✅ TODOS OS TESTES PASSARAM' : '❌ ALGUNS TESTES FALHARAM'}`);
  
  return { success: allSuccess, results };
}

/**
 * Testa o logout
 */
export async function testLogout(): Promise<{ success: boolean; message: string }> {
  console.log('[AuthTest] 🔄 Testando logout...');
  
  try {
    // Verificar se há usuário logado
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      console.log('[AuthTest] ⚠️ Nenhum usuário logado para testar logout');
      return { success: true, message: 'Nenhum usuário logado' };
    }
    
    console.log(`[AuthTest] 👤 Usuário atual: ${currentUser.email}`);
    
    // Fazer logout
    await AuthService.logout();
    console.log('[AuthTest] ✅ Logout executado com sucesso');
    
    // Verificar se o logout foi efetivo
    const userAfterLogout = await AuthService.getCurrentUser();
    if (userAfterLogout) {
      console.error('[AuthTest] ❌ Logout falhou - usuário ainda está logado:', userAfterLogout);
      return { success: false, message: 'Usuário ainda está logado após logout' };
    } else {
      console.log('[AuthTest] ✅ Logout confirmado - nenhum usuário logado');
      return { success: true, message: 'Logout realizado com sucesso' };
    }
  } catch (error) {
    console.error('[AuthTest] ❌ Erro no teste de logout:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

/**
 * Executa todos os testes de autenticação
 */
export async function runAllAuthTests(): Promise<boolean> {
  console.log('[AuthTest] 🚀 Iniciando bateria completa de testes de autenticação...');
  
  try {
    // Teste 1: Logins válidos
    const validTest = await testValidLogin();
    
    // Teste 2: Logins inválidos
    const invalidTest = await testInvalidLogin();
    
    // Teste 3: Testar logout
    const logoutTest = await testLogout();
    
    // Teste 4: Verificar estado inicial
    const currentUser = await AuthService.getCurrentUser();
    const shouldBeNull = currentUser === null;
    
    console.log(`[AuthTest] Estado inicial limpo: ${shouldBeNull ? '✅' : '❌'}`);
    
    const allTestsPassed = validTest.success && invalidTest.success && logoutTest.success && shouldBeNull;
    
    console.log(`[AuthTest] 🏁 RESULTADO FINAL: ${allTestsPassed ? '✅ TODOS OS TESTES PASSARAM' : '❌ ALGUNS TESTES FALHARAM'}`);
    
    return allTestsPassed;
  } catch (error) {
    console.error('[AuthTest] ❌ Erro inesperado durante os testes:', error);
    return false;
  }
}

/**
 * Função utilitária para executar os testes via console do navegador
 * Use: window.testAuth()
 */
if (typeof window !== 'undefined') {
  (window as any).testAuth = runAllAuthTests;
  (window as any).testValidLogin = testValidLogin;
  (window as any).testInvalidLogin = testInvalidLogin;
  (window as any).testLogout = testLogout;
  console.log('[AuthTest] 🔧 Funções de teste disponíveis: window.testAuth(), window.testValidLogin(), window.testInvalidLogin(), window.testLogout()');
}