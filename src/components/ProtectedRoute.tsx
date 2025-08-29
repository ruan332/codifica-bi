import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageLoading } from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireClient?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireAdmin = false, 
  requireClient = false 
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, isClient } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return <PageLoading text="Verificando autenticação..." />;
  }

  // Se requer autenticação mas usuário não está logado
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se não requer autenticação mas usuário está logado, redirecionar para dashboard apropriado
  if (!requireAuth && user) {
    const redirectTo = isAdmin ? '/admin' : '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  // Se requer admin mas usuário não é admin
  if (requireAdmin && !isAdmin) {
    // Se é cliente, redirecionar para dashboard do cliente
    if (isClient) {
      return <Navigate to="/dashboard" replace />;
    }
    // Se não está logado, redirecionar para login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se requer cliente mas usuário não é cliente
  if (requireClient && !isClient) {
    // Se é admin, redirecionar para dashboard admin
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    // Se não está logado, redirecionar para login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se passou por todas as verificações, renderizar o componente
  return <>{children}</>;
}

// Componente específico para rotas de admin
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth requireAdmin>
      {children}
    </ProtectedRoute>
  );
}

// Componente específico para rotas de cliente
export function ClientRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth requireClient>
      {children}
    </ProtectedRoute>
  );
}

// Componente para rotas que requerem apenas autenticação (admin ou cliente)
export function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth>
      {children}
    </ProtectedRoute>
  );
}

// Componente para rotas públicas (apenas para usuários não logados)
export function PublicRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false}>
      {children}
    </ProtectedRoute>
  );
}