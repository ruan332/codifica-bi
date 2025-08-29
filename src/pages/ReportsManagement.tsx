import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Eye, BarChart3, ExternalLink } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { PageLoading } from '../components/Loading';
import { ReportFormModal } from '../components/ReportFormModal';
import { InlineAlertContainer } from '../components/AlertContainer';
import { useAlert } from '../hooks/useAlert';
import type { Report, ReportFormData } from '../types';

export function ReportsManagement() {
  const { reports, loading, error, createReport, updateReport, deleteReport, refetch } = useReports();
  const { alerts, removeAlert, showSuccess, showError, showWarning } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);

  // Filtrar relatórios baseado na busca
  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateReport = () => {
    setEditingReport(null);
    setIsModalOpen(true);
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    setIsModalOpen(true);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Tem certeza que deseja excluir este relatório? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setDeletingReportId(reportId);
      await deleteReport(reportId);
      showSuccess('Relatório excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir relatório:', error);
      showError('Erro ao excluir relatório. Tente novamente.');
    } finally {
      setDeletingReportId(null);
    }
  };

  const handleSubmitReport = async (data: ReportFormData) => {
    try {
      if (editingReport) {
        await updateReport(editingReport.id, data);
        showSuccess('Relatório atualizado com sucesso!');
      } else {
        await createReport(data);
        showSuccess('Relatório criado com sucesso!');
      }
      setIsModalOpen(false);
      setEditingReport(null);
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      showError('Erro ao salvar relatório. Tente novamente.');
    }
  };

  const handleViewReport = (report: Report) => {
    window.open(`/report/${report.id}`, '_blank');
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

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gerenciamento de Relatórios</h1>
            <p className="text-slate-600 mt-2">
              Crie, edite e gerencie os relatórios do Power BI disponíveis para os clientes.
            </p>
          </div>
          <Button onClick={handleCreateReport} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Novo Relatório</span>
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Relatórios</p>
                <p className="text-3xl font-bold text-slate-900">{reports.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Relatórios Ativos</p>
                <p className="text-3xl font-bold text-slate-900">{reports.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Filtrados</p>
                <p className="text-3xl font-bold text-slate-900">{filteredReports.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar relatórios por título ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                refetch();
              }}
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      <InlineAlertContainer
        alerts={alerts}
        onDismiss={removeAlert}
        className="mb-6"
      />

      {/* Lista de Relatórios */}
      {error && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="text-red-600 text-center">
              <p>Erro ao carregar relatórios: {error}</p>
              <Button variant="outline" onClick={refetch} className="mt-2">
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm ? 'Nenhum relatório encontrado' : 'Nenhum relatório cadastrado'}
            </h3>
            <p className="text-slate-600 mb-4">
              {searchTerm 
                ? 'Tente ajustar os termos de busca.' 
                : 'Comece criando seu primeiro relatório do Power BI.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateReport}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Relatório
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {report.title}
                        </h3>
                        {report.description && (
                          <p className="text-slate-600 mb-3 line-clamp-2">
                            {report.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <span>Criado em: {formatDate(report.created_at)}</span>
                          <span>•</span>
                          <span>Atualizado em: {formatDate(report.updated_at)}</span>
                        </div>
                        <div className="mt-2">
                          <a
                            href={report.power_bi_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Ver no Power BI
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReport(report)}
                      title="Visualizar relatório"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditReport(report)}
                      title="Editar relatório"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReport(report.id)}
                      loading={deletingReportId === report.id}
                      disabled={deletingReportId === report.id}
                      title="Excluir relatório"
                      className="text-red-600 hover:text-red-800 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Formulário */}
      <ReportFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReport(null);
        }}
        onSubmit={handleSubmitReport}
        report={editingReport}
      />
    </div>
  );
}