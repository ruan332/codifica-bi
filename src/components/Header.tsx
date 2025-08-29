import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Settings, 
  Home, 
  AlertTriangle, 
  TrendingUp,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './Avatar';
import { cn } from '../lib/utils';

export function Header() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    console.log('[Header] Iniciando handleLogout...');
    try {
      console.log('[Header] Chamando função logout do useAuth...');
      await logout();
      console.log('[Header] Logout concluído, navegando para /login...');
      navigate('/login');
      console.log('[Header] Navegação para /login concluída');
    } catch (error) {
      console.error('[Header] Erro ao fazer logout:', error);
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const clientNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
  ];

  const adminNavItems = [
    { path: '/admin', label: 'Painel Admin', icon: BarChart3 },
    { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/admin/clients', label: 'Clientes', icon: Users },
    { path: '/admin/reports', label: 'Relatórios', icon: Settings },
    { path: '/admin/alerts', label: 'Alertas', icon: AlertTriangle },
  ];

  const navItems = isAdmin ? adminNavItems : clientNavItems;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to={isAdmin ? '/admin' : '/dashboard'} 
              className="flex items-center gap-2 text-slate-800 hover:text-slate-600 transition-colors"
            >
              <img 
                src="/logo.svg" 
                alt="Codifica Analytics" 
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Avatar 
                  initials={user?.email?.charAt(0).toUpperCase()} 
                  className="bg-blue-100 text-blue-700 w-8 h-8"
                />
                <span className="text-sm font-medium text-gray-700">
                  {user?.email?.split('@')[0]}
                </span>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <Avatar 
                          initials={user?.email?.charAt(0).toUpperCase()} 
                          className="bg-blue-100 text-blue-700 w-10 h-10"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{user?.email}</div>
                          <div className="text-sm text-gray-500 capitalize">
                            {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile User Section */}
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="flex items-center px-5">
                <Avatar 
                  initials={user?.email?.charAt(0).toUpperCase()} 
                  className="bg-blue-100 text-blue-700 w-10 h-10"
                />
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user?.email}</div>
                  <div className="text-sm text-gray-500 capitalize">
                    {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay para fechar menus ao clicar fora */}
      {(isMobileMenuOpen || isUserMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </header>
  );
}