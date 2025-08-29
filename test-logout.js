// Script para testar logout no console do navegador
// Cole este código no console do navegador (F12) para testar o logout

console.log('🧪 Iniciando teste de logout...');

// Função para testar logout
window.testLogout = async function() {
  try {
    console.log('🔍 [TEST] Iniciando teste de logout...');
    
    // Importar o AuthService
    const { AuthService } = await import('./src/services/auth.js');
    
    console.log('📞 [TEST] Chamando AuthService.logout()...');
    await AuthService.logout();
    
    console.log('✅ [TEST] Logout concluído com sucesso!');
    console.log('🔄 [TEST] Aguardando 2 segundos para ver se o listener detecta a mudança...');
    
    setTimeout(() => {
      console.log('🏁 [TEST] Teste concluído. Verifique se o usuário foi deslogado.');
    }, 2000);
    
  } catch (error) {
    console.error('❌ [TEST] Erro no teste de logout:', error);
  }
};

// Função para verificar estado atual
window.checkAuthState = async function() {
  try {
    const { AuthService } = await import('./src/services/auth.js');
    const user = await AuthService.getCurrentUser();
    console.log('👤 [CHECK] Usuário atual:', user);
    return user;
  } catch (error) {
    console.error('❌ [CHECK] Erro ao verificar usuário:', error);
    return null;
  }
};

console.log('✅ Funções de teste carregadas!');
console.log('📋 Use: testLogout() para testar logout');
console.log('📋 Use: checkAuthState() para verificar usuário atual');