import { useState, useEffect, useCallback } from 'react';
import { ReportsService } from '../services/reports';
import type { Report, ReportFormData, UseReportsReturn, UseClientReportsReturn } from '../types';

// Hook para administradores gerenciarem todos os relatórios
export function useReports(): UseReportsReturn {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar relatórios
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ReportsService.getReports();
      setReports(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar relatórios';
      setError(errorMessage);
      console.error('Erro ao buscar relatórios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar relatórios ao inicializar
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Criar relatório
  const createReport = useCallback(async (data: ReportFormData) => {
    try {
      setError(null);
      const newReport = await ReportsService.createReport(data);
      setReports(prev => [newReport, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar relatório';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Atualizar relatório
  const updateReport = useCallback(async (id: string, data: Partial<ReportFormData>) => {
    try {
      setError(null);
      const updatedReport = await ReportsService.updateReport(id, data);
      setReports(prev => 
        prev.map(report => 
          report.id === id ? updatedReport : report
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar relatório';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Deletar relatório
  const deleteReport = useCallback(async (id: string) => {
    try {
      setError(null);
      await ReportsService.deleteReport(id);
      setReports(prev => prev.filter(report => report.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar relatório';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Recarregar dados
  const refetch = useCallback(async () => {
    await fetchReports();
  }, [fetchReports]);

  return {
    reports,
    loading,
    error,
    createReport,
    updateReport,
    deleteReport,
    refetch,
  };
}

// Hook para clientes acessarem seus relatórios
export function useClientReports(userId: string): UseClientReportsReturn {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar relatórios do cliente
  const fetchClientReports = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await ReportsService.getClientReports(userId);
      setReports(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar relatórios';
      setError(errorMessage);
      console.error('Erro ao buscar relatórios do cliente:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Carregar relatórios ao inicializar ou quando userId mudar
  useEffect(() => {
    fetchClientReports();
  }, [fetchClientReports]);

  // Registrar acesso a um relatório
  const logAccess = useCallback(async (reportId: string) => {
    try {
      // Usar IP padrão para evitar requisições externas desnecessárias
      await ReportsService.logAccess(userId, reportId, '0.0.0.0');
    } catch (err) {
      console.error('Erro ao registrar acesso:', err);
      // Não lançar erro para não interromper a visualização do relatório
    }
  }, [userId]);

  // Recarregar dados
  const refetch = useCallback(async () => {
    await fetchClientReports();
  }, [fetchClientReports]);

  return {
    reports,
    loading,
    error,
    logAccess,
    refetch,
  };
}

// Hook para buscar um relatório específico
export function useReport(reportId: string) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await ReportsService.getReportById(reportId);
        setReport(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar relatório';
        setError(errorMessage);
        console.error('Erro ao buscar relatório:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  return { report, loading, error };
}

// Hook para verificar acesso a um relatório
export function useReportAccess(userId: string, reportId: string) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!userId || !reportId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const access = await ReportsService.hasAccessToReport(userId, reportId);
        setHasAccess(access);
      } catch (err) {
        console.error('Erro ao verificar acesso:', err);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [userId, reportId]);

  return { hasAccess, loading };
}