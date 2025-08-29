import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';

import { AuthService } from '../services/auth';
import type { LoginCredentials } from '../types';

export function Login() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !authLoading) {
      const from = (location.state as any)?.from?.pathname || 
                   (user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
      // O redirecionamento será feito pelo useEffect acima
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    // Limpar erro quando o usuário começar a digitar
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Mostrar loading se ainda estiver verificando autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-slate-600 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <BarChart3 className="h-12 w-12 text-slate-800" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-slate-900">
            Codifica Analytics
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Faça login para acessar seus relatórios
          </p>
        </div>

        {/* Login Form */}
        <Card className="mt-8">
          <CardContent className="py-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={credentials.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                disabled={loading}
              />

              <div className="relative">
                <Input
                  label="Senha"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="Sua senha"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={!credentials.email || !credentials.password}
              >
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>



        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            &copy; 2024 Codifica Analytics. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}