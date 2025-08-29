import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute, AdminRoute, ClientRoute, PublicRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ReportView } from './pages/ReportView';
import { AdminDashboard } from './pages/AdminDashboard';
import { ClientsManagement } from './pages/ClientsManagement';
import { ReportsManagement } from './pages/ReportsManagement';
import { AlertExamples } from './pages/AlertExamples';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './utils/authTest'; // Importar testes de autenticação para desenvolvimento

function AppContent() {
  const { user, loading } = useAuth();

  // Mostrar loading inicial enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando aplicação...</p>
          <p className="text-xs text-slate-400 mt-2">Verificando conectividade...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Rota raiz - redireciona baseado no status de autenticação */}
          <Route 
            path="/" 
            element={
              user ? (
                <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Rotas públicas (apenas para usuários não logados) */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          {/* Rotas do cliente */}
          <Route 
            path="/dashboard" 
            element={
              <ClientRoute>
                <Dashboard />
              </ClientRoute>
            } 
          />
          
          <Route 
            path="/report/:id" 
            element={
              <ProtectedRoute requireAuth>
                <ReportView />
              </ProtectedRoute>
            } 
          />
          
          {/* Rotas do administrador */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          
          <Route 
            path="/admin/clients" 
            element={
              <AdminRoute>
                <ClientsManagement />
              </AdminRoute>
            } 
          />
          
          <Route 
            path="/admin/reports" 
            element={
              <AdminRoute>
                <ReportsManagement />
              </AdminRoute>
            } 
          />
          
          <Route 
            path="/admin/alerts" 
            element={
              <AdminRoute>
                <AlertExamples />
              </AdminRoute>
            } 
          />
          
          <Route 
            path="/admin/analytics" 
            element={
              <AdminRoute>
                <AnalyticsDashboard />
              </AdminRoute>
            } 
          />
          
          {/* Rota 404 */}
          <Route 
            path="*" 
            element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-slate-900 mb-4">404</h1>
                  <p className="text-slate-600 mb-8">Página não encontrada</p>
                  <button 
                    onClick={() => window.history.back()}
                    className="text-slate-800 hover:text-slate-600 underline"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            } 
          />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
