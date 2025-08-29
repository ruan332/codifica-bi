import { supabase, supabaseAdmin } from '../lib/supabase';
import type { Report, ReportFormData, AccessLog } from '../types';

export class ReportsService {
  // Buscar todos os relatórios
  static async getReports(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // Buscar relatório por ID
  static async getReportById(id: string): Promise<Report | null> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Relatório não encontrado
      }
      throw new Error(error.message);
    }

    return data;
  }

  // Buscar relatórios disponíveis para um cliente
  static async getClientReports(userId: string): Promise<Report[]> {
    // Primeiro, buscar o cliente pelo user_id
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (clientError) {
      throw new Error('Cliente não encontrado');
    }

    // Depois, buscar os relatórios associados ao cliente
    const { data, error } = await supabase
      .from('client_reports')
      .select(`
        report:reports(*)
      `)
      .eq('client_id', client.id);

    if (error) {
      throw new Error(error.message);
    }

    return (data?.map(item => item.report).filter(Boolean) as unknown as Report[]) || [];
  }

  // Criar novo relatório
  static async createReport(reportData: ReportFormData): Promise<Report> {
    console.log('Creating report with data:', reportData);
    
    // Usar supabaseAdmin para operações de INSERT devido às políticas RLS
    const { data, error } = await supabaseAdmin
      .from('reports')
      .insert({
        title: reportData.title,
        description: reportData.description,
        power_bi_url: reportData.power_bi_url,
        iframe_code: reportData.iframe_code,
      })
      .select();

    console.log('Insert result:', { data, error });

    if (error) {
      console.error('Error creating report:', error);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error('Nenhum dado retornado após criar o relatório');
    }

    return data[0];
  }

  // Atualizar relatório
  static async updateReport(id: string, reportData: Partial<ReportFormData>): Promise<Report> {
    console.log('Updating report:', id, 'with data:', reportData);
    
    // Usar supabaseAdmin para operações de UPDATE devido às políticas RLS
    const { data, error } = await supabaseAdmin
      .from('reports')
      .update({
        title: reportData.title,
        description: reportData.description,
        power_bi_url: reportData.power_bi_url,
        iframe_code: reportData.iframe_code,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    console.log('Update result:', { data, error });

    if (error) {
      console.error('Error updating report:', error);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error('Nenhum dado retornado após atualizar o relatório');
    }

    return data[0];
  }

  // Deletar relatório
  static async deleteReport(id: string): Promise<void> {
    // Usar supabaseAdmin para operações de DELETE devido às políticas RLS
    const { error } = await supabaseAdmin
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  // Registrar acesso a um relatório
  static async logAccess(userId: string, reportId: string, ipAddress?: string): Promise<void> {
    const { error } = await supabase
      .from('access_logs')
      .insert({
        user_id: userId,
        report_id: reportId,
        ip_address: ipAddress || '0.0.0.0',
      });

    if (error) {
      throw new Error(error.message);
    }
  }

  // Buscar logs de acesso
  static async getAccessLogs(limit: number = 50): Promise<AccessLog[]> {
    const { data, error } = await supabase
      .from('access_logs')
      .select(`
        *,
        user:users(id, email, role),
        report:reports(id, title)
      `)
      .order('accessed_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // Buscar logs de acesso de um usuário específico
  static async getUserAccessLogs(userId: string, limit: number = 20): Promise<AccessLog[]> {
    const { data, error } = await supabase
      .from('access_logs')
      .select(`
        *,
        report:reports(id, title)
      `)
      .eq('user_id', userId)
      .order('accessed_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // Buscar logs de acesso de um relatório específico
  static async getReportAccessLogs(reportId: string, limit: number = 20): Promise<AccessLog[]> {
    const { data, error } = await supabase
      .from('access_logs')
      .select(`
        *,
        user:users(id, email, role)
      `)
      .eq('report_id', reportId)
      .order('accessed_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // Buscar estatísticas dos relatórios
  static async getReportsStats() {
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('id');

    if (reportsError) {
      throw new Error(reportsError.message);
    }

    const { data: accesses, error: accessesError } = await supabase
      .from('access_logs')
      .select('id');

    if (accessesError) {
      throw new Error(accessesError.message);
    }

    return {
      total_reports: reports?.length || 0,
      total_accesses: accesses?.length || 0,
    };
  }

  // Buscar relatórios mais acessados
  static async getMostAccessedReports(limit: number = 5) {
    const { data, error } = await supabase
      .from('access_logs')
      .select(`
        report_id,
        report:reports(id, title, description)
      `)
      .not('report', 'is', null);

    if (error) {
      throw new Error(error.message);
    }

    // Contar acessos por relatório
    const accessCounts = data?.reduce((acc, log) => {
      const reportId = log.report_id;
      acc[reportId] = (acc[reportId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Ordenar por número de acessos e pegar os top N
    const sortedReports = Object.entries(accessCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([reportId, count]) => {
        const reportData = data?.find(log => log.report_id === reportId)?.report;
        return {
          report: reportData,
          access_count: count,
        };
      })
      .filter(item => item.report);

    return sortedReports;
  }

  // Verificar se um usuário tem acesso a um relatório
  static async hasAccessToReport(userId: string, reportId: string): Promise<boolean> {
    // Primeiro, verificar se é admin
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId);

    if (userError || !users || users.length === 0) {
      return false;
    }

    const user = users[0];
    
    if (user.role === 'admin') {
      return true;
    }

    // Se for cliente, verificar se tem acesso ao relatório
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId);

    if (clientError || !clients || clients.length === 0) {
      return false;
    }

    const client = clients[0];
    
    const { data: clientReports, error } = await supabase
      .from('client_reports')
      .select('id')
      .eq('client_id', client.id)
      .eq('report_id', reportId);

    const hasAccess = !error && clientReports && clientReports.length > 0;
    
    return hasAccess;
  }
}