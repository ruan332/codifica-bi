import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  Eye, 
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { PageLoading } from '../components/Loading';
import { InlineAlertContainer } from '../components/AlertContainer';
import { useAlert } from '../hooks/useAlert';
import { ClientsService } from '../services/clients';
import { ReportsService } from '../services/reports';
import type { DashboardStats } from '../types';

// Componente de gráfico simples usando SVG
const SimpleBarChart = ({ data, title }: { data: Array<{label: string, value: number}>, title: string }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const chartHeight = 200;
  const barWidth = 40;
  const spacing = 60;
  
  return (
    <div className="w-full">
      <h4 className="text-sm font-medium text-slate-700 mb-4">{title}</h4>
      <svg width="100%" height={chartHeight + 40} className="overflow-visible">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const x = index * spacing + 20;
          const y = chartHeight - barHeight + 20;
          
          return (
            <g key={item.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#3b82f6"
                className="hover:fill-blue-600 transition-colors"
                rx={4}
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight + 35}
                textAnchor="middle"
                className="text-xs fill-slate-600"
              >
                {item.label}
              </text>
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                className="text-xs fill-slate-700 font-medium"
              >
                {item.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Componente de gráfico de linha simples
const SimpleLineChart = ({ data, title }: { data: Array<{label: string, value: number}>, title: string }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const chartHeight = 200;
  const chartWidth = 400;
  const padding = 40;
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * (chartWidth - 2 * padding) + padding;
    const y = chartHeight - ((item.value - minValue) / (maxValue - minValue)) * (chartHeight - 2 * padding) + padding;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="w-full">
      <h4 className="text-sm font-medium text-slate-700 mb-4">{title}</h4>
      <svg width={chartWidth} height={chartHeight + 40} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          className="drop-shadow-sm"
        />
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * (chartWidth - 2 * padding) + padding;
          const y = chartHeight - ((item.value - minValue) / (maxValue - minValue)) * (chartHeight - 2 * padding) + padding;
          
          return (
            <g key={item.label}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="#10b981"
                className="hover:r-6 transition-all"
              />
              <text
                x={x}
                y={chartHeight + 35}
                textAnchor="middle"
                className="text-xs fill-slate-600"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Componente de gráfico de pizza simples
const SimplePieChart = ({ data, title }: { data: Array<{label: string, value: number, color: string}>, title: string }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  
  let currentAngle = 0;
  
  return (
    <div className="w-full">
      <h4 className="text-sm font-medium text-slate-700 mb-4">{title}</h4>
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width={200} height={200}>
            {data.map((item, index) => {
              const angle = (item.value / total) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
              const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              currentAngle += angle;
              
              return (
                <path
                  key={item.label}
                  d={pathData}
                  fill={item.color}
                  className="hover:opacity-80 transition-opacity"
                />
              );
            })}
          </svg>
        </div>
        <div className="ml-6 space-y-2">
          {data.map((item) => (
            <div key={item.label} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-slate-600">
                {item.label}: {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { alerts, removeAlert, showSuccess, showError, showInfo } = useAlert();
  
  // Dados mockados para os gráficos
  const [chartData] = useState({
    monthlyAccesses: [
      { label: 'Jan', value: 45 },
      { label: 'Fev', value: 52 },
      { label: 'Mar', value: 48 },
      { label: 'Abr', value: 61 },
      { label: 'Mai', value: 55 },
      { label: 'Jun', value: 67 }
    ],
    reportsByCategory: [
      { label: 'Financeiro', value: 12, color: '#3b82f6' },
      { label: 'Vendas', value: 8, color: '#10b981' },
      { label: 'Marketing', value: 6, color: '#f59e0b' },
      { label: 'Operacional', value: 4, color: '#ef4444' }
    ],
    weeklyTrend: [
      { label: 'Seg', value: 23 },
      { label: 'Ter', value: 34 },
      { label: 'Qua', value: 28 },
      { label: 'Qui', value: 41 },
      { label: 'Sex', value: 38 },
      { label: 'Sáb', value: 15 },
      { label: 'Dom', value: 12 }
    ]
  });

  const fetchDashboardData = async () => {
    try {
      setError(null);
      if (!refreshing) setLoading(true);

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
      
      if (refreshing) {
        showSuccess('Dados atualizados com sucesso!');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(errorMessage);
      showError('Erro ao carregar dados do dashboard');
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  const handleExport = () => {
    showInfo('Funcionalidade de exportação será implementada em breve');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !refreshing) {
    return <PageLoading text="Carregando dashboard analítico..." />;
  }

  if (error && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={fetchDashboardData} 
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Dashboard Analítico
            </h1>
            <p className="mt-2 text-slate-600">
              Visualizações avançadas e métricas detalhadas
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Alertas */}
      <InlineAlertContainer
        alerts={alerts}
        onDismiss={removeAlert}
        className="mb-6"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total de Clientes</p>
                <p className="text-3xl font-bold">
                  {stats?.total_clients || 0}
                </p>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+12% vs mês anterior</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Relatórios Ativos</p>
                <p className="text-3xl font-bold">
                  {stats?.total_reports || 0}
                </p>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+8% vs mês anterior</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total de Acessos</p>
                <p className="text-3xl font-bold">
                  {stats?.total_accesses || 0}
                </p>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+24% vs mês anterior</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Taxa de Engajamento</p>
                <p className="text-3xl font-bold">
                  {stats?.total_clients ? 
                    Math.round((stats.active_clients / stats.total_clients) * 100) : 0
                  }%
                </p>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span>-3% vs mês anterior</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Eye className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">
              Acessos Mensais
            </h3>
          </CardHeader>
          <CardContent>
            <SimpleBarChart 
              data={chartData.monthlyAccesses} 
              title="Evolução de Acessos por Mês"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">
              Relatórios por Categoria
            </h3>
          </CardHeader>
          <CardContent>
            <SimplePieChart 
              data={chartData.reportsByCategory} 
              title="Distribuição por Categoria"
            />
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trend and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">
              Tendência Semanal
            </h3>
          </CardHeader>
          <CardContent>
            <SimpleLineChart 
              data={chartData.weeklyTrend} 
              title="Acessos por Dia da Semana"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">
              Atividade Recente
            </h3>
          </CardHeader>
          <CardContent>
            {stats?.recent_accesses && stats.recent_accesses.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_accesses.slice(0, 5).map((access) => (
                  <div key={access.id} className="flex items-center space-x-3 py-2">
                    <div className="p-2 bg-slate-100 rounded-full">
                      <Eye className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {access.report?.title || 'Relatório não encontrado'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {access.user?.email || 'Usuário não encontrado'}
                      </p>
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatDate(access.accessed_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Nenhuma atividade recente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}