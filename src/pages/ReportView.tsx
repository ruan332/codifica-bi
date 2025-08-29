import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Maximize2, Minimize2, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useReport, useReportAccess } from '../hooks/useReports';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { PageLoading } from '../components/Loading';

export function ReportView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { report, loading: reportLoading, error: reportError } = useReport(id || '');
  const { hasAccess, loading: accessLoading } = useReportAccess(user?.id || '', id || '');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Redirecionar se não tiver acesso
  useEffect(() => {
    if (!accessLoading && !hasAccess && !isAdmin) {
      navigate('/dashboard', { replace: true });
    }
  }, [hasAccess, accessLoading, isAdmin, navigate]);

  const handleBack = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const refreshReport = () => {
    setIframeKey(prev => prev + 1);
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

  if (reportLoading || accessLoading) {
    return <PageLoading text="Carregando relatório..." />;
  }

  if (reportError) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Erro ao carregar relatório
            </h3>
            <p className="text-red-700 mb-4">{reportError}</p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Relatório não encontrado
            </h3>
            <p className="text-slate-600 mb-4">
              O relatório solicitado não existe ou você não tem permissão para acessá-lo.
            </p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
      {/* Header */}
      <div className={`${isFullscreen ? 'p-4' : 'mb-6'} flex items-center justify-between`}>
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {report.title}
            </h1>
            {report.description && (
              <p className="text-slate-600 mt-1">
                {report.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={refreshReport}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="sm"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div className={`${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[600px] lg:h-[700px]'} bg-white rounded-lg border border-slate-200 overflow-hidden`}>
        {report.iframe_code ? (
          <div 
            key={iframeKey}
            className="w-full h-full"
            dangerouslySetInnerHTML={{ 
              __html: report.iframe_code.replace(
                /<iframe([^>]*)>/i, 
                `<iframe$1 style="width: 100%; height: 100%; border: none;">`
              )
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Código do iframe não disponível
              </h3>
              <p className="text-slate-600 mb-4">
                Este relatório não possui um código de incorporação válido.
              </p>
              {report.power_bi_url && (
                <a
                  href={report.power_bi_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-800 hover:text-slate-600 underline"
                >
                  Abrir no Power BI
                </a>
              )}
            </div>
          </div>
        )}
      </div>


    </div>
  );
}