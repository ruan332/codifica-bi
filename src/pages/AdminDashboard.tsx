import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BarChart3, Activity, TrendingUp, Eye, Calendar, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { PageLoading } from '../components/Loading';
import { ClientsService } from '../services/clients';
import { ReportsService } from '../services/reports';
import type { AccessLog, DashboardStats } from '../types';

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar estatísticas em paralelo
        const [clientsStats, reportsStats, recentAccesses] = await Promise.all([
          ClientsService.getClientsStats(),
          ReportsService.getReportsStats(),
          ReportsService.getAccessLogs(10),
        ]);

        setStats({
          total_clients: clientsStats.total_clients,
          active_clients: clientsStats.active_clients,
          total_reports: reportsStats.total_reports,
          total_accesses: reportsStats.total_accesses,
          recent_accesses: recentAccesses,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados';
        setError(errorMessage);
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <PageLoading text="Carregando painel administrativo..." />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="mt-4"
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Painel Administrativo
        </h1>
        <p className="mt-2 text-slate-600">Visão geral do sistema e métricas de uso</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 flex flex-wrap gap-4">
        <Link to="/admin/clients">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </Link>
        <Link to="/admin/reports">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Novo Relatório
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Clientes</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats?.total_clients || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">
                {stats?.active_clients || 0} ativos
              </span>
              <span className="text-slate-500 ml-2">
                de {stats?.total_clients || 0} total
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Relatórios</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats?.total_reports || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">Disponíveis</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Acessos</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats?.total_accesses || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Eye className="h-4 w-4 text-purple-500 mr-1" />
              <span className="text-purple-600 font-medium">Visualizações</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Taxa de Atividade</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats?.total_clients ? 
                    Math.round((stats.active_clients / stats.total_clients) * 100) : 0
                  }%
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-orange-600 font-medium">
                Clientes ativos
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">
              Acessos Recentes
            </h3>
          </CardHeader>
          <CardContent>
            {stats?.recent_accesses && stats.recent_accesses.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_accesses.map((access) => (
                  <div key={access.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-100 rounded-full">
                        <Eye className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {access.report?.title || 'Relatório não encontrado'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {access.user?.email || 'Usuário não encontrado'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        {formatDate(access.accessed_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500">Nenhum acesso recente</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">
              Ações Rápidas
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link 
                to="/admin/clients" 
                className="flex items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Users className="h-5 w-5 text-slate-600 mr-3" />
                <div>
                  <p className="font-medium text-slate-900">Gerenciar Clientes</p>
                  <p className="text-sm text-slate-600">Criar, editar e gerenciar clientes</p>
                </div>
              </Link>
              
              <Link 
                to="/admin/reports" 
                className="flex items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <BarChart3 className="h-5 w-5 text-slate-600 mr-3" />
                <div>
                  <p className="font-medium text-slate-900">Gerenciar Relatórios</p>
                  <p className="text-sm text-slate-600">Criar e configurar relatórios</p>
                </div>
              </Link>
              
              <div className="flex items-center p-4 bg-slate-50 rounded-lg">
                <Calendar className="h-5 w-5 text-slate-600 mr-3" />
                <div>
                  <p className="font-medium text-slate-900">Última Atualização</p>
                  <p className="text-sm text-slate-600">
                    {new Date().toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}