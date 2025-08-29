import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Search, Calendar, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useClientReports } from '../hooks/useReports';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Input } from '../components/Input';
import { PageLoading } from '../components/Loading';
import { InlineAlertContainer } from '../components/AlertContainer';
import { useAlert } from '../hooks/useAlert';

import type { Report } from '../types';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { reports, loading, error, logAccess } = useClientReports(user?.id || '');
  const { alerts, removeAlert, showSuccess, showError, showInfo } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');



  // Filtrar relatórios baseado na busca
  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleReportClick = (report: Report) => {
    try {
      // Log de acesso ao relatório
      logAccess(report.id);
      
      // Feedback visual para o usuário
      showInfo(`Abrindo ${report.title}...`);
      
      // Navegar para a página do relatório
      navigate(`/report/${report.id}`);
    } catch (error) {
      console.error('Erro ao navegar:', error);
      showError('Erro ao abrir o relatório');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return <PageLoading text="Carregando seus relatórios..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Bem-vindo, {user?.email?.split('@')[0]}!
        </h1>
        <p className="mt-2 text-slate-600">
          Acesse seus relatórios de Business Intelligence
        </p>
      </div>

      {/* Alertas */}
      <InlineAlertContainer
        alerts={alerts}
        onDismiss={removeAlert}
        className="mb-6"
      />



      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar relatórios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm ? 'Nenhum relatório encontrado' : 'Nenhum relatório disponível'}
            </h3>
            <p className="text-slate-600">
              {searchTerm 
                ? 'Tente ajustar os termos de busca.' 
                : 'Entre em contato com o administrador para ter acesso aos relatórios.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <Card
              key={report.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleReportClick(report);
              }}
              hover
              className="p-6 group"
            >
              <div className="mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors duration-200">
                      <BarChart3 className="h-6 w-6 text-slate-600 group-hover:text-blue-600 transition-colors duration-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 truncate group-hover:text-blue-900 transition-colors duration-200">
                        {report.title}
                      </h3>
                    </div>
                  </div>
                  <Eye className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors duration-200" />
                </div>
              </div>
              
              <div>
                <p className="text-slate-600 text-sm mb-4 line-clamp-3 group-hover:text-slate-700 transition-colors duration-200">
                  {report.description || 'Sem descrição disponível'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-1 group-hover:text-slate-600 transition-colors duration-200">
                    <Calendar className="h-3 w-3" />
                    <span>Criado em {formatDate(report.created_at)}</span>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full group-hover:bg-green-200 transition-colors duration-200">
                    Disponível
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}


    </div>
  );
}