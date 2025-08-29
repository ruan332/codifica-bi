import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Header />}
      <main className={user ? 'pt-16' : ''}>
        {children || <Outlet />}
      </main>
    </div>
  );
}