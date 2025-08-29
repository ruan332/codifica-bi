import { supabase } from '../lib/supabase';
import { AuthService } from './auth';
import type { Client, ClientFormData } from '../types';

export class ClientsService {
  // Buscar todos os clientes (apenas para admins)
  static async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        user:users(id, email, role)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // Buscar cliente por ID
  static async getClientById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        user:users(id, email, role)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Cliente não encontrado
      }
      throw new Error(error.message);
    }

    return data;
  }

  // Buscar cliente pelo user_id
  static async getClientByUserId(userId: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        user:users(id, email, role)
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Cliente não encontrado
      }
      throw new Error(error.message);
    }

    return data;
  }

  // Criar novo cliente
  static async createClient(clientData: ClientFormData): Promise<Client> {
    try {
      // Primeiro, criar o usuário
      const user = await AuthService.createUser(
        clientData.email,
        clientData.password,
        'client'
      );

      // Depois, criar o cliente
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: clientData.name,
          cnpj: clientData.cnpj,
          user_id: user.id,
          is_active: clientData.is_active,
        })
        .select(`
          *,
          user:users(id, email, role)
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Associar relatórios se fornecidos
      if (clientData.report_ids && clientData.report_ids.length > 0) {
        await this.associateReports(data.id, clientData.report_ids);
      }

      return data;
    } catch (error) {
      throw new Error(`Erro ao criar cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // Atualizar cliente
  static async updateClient(id: string, clientData: Partial<ClientFormData>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update({
        name: clientData.name,
        cnpj: clientData.cnpj,
        is_active: clientData.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        user:users(id, email, role)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Atualizar associações de relatórios se fornecidas
    if (clientData.report_ids !== undefined) {
      await this.updateReportAssociations(id, clientData.report_ids);
    }

    return data;
  }

  // Deletar cliente
  static async deleteClient(id: string): Promise<void> {
    // Primeiro, buscar o user_id do cliente
    const client = await this.getClientById(id);
    if (!client) {
      throw new Error('Cliente não encontrado');
    }

    // Deletar o cliente (isso também deletará as associações devido ao CASCADE)
    const { error: clientError } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (clientError) {
      throw new Error(clientError.message);
    }

    // Deletar o usuário do auth (opcional, dependendo da regra de negócio)
    // const { error: authError } = await supabase.auth.admin.deleteUser(client.user_id);
    // if (authError) {
    //   console.warn('Erro ao deletar usuário do auth:', authError.message);
    // }
  }

  // Alternar status do cliente
  static async toggleClientStatus(id: string, isActive: boolean): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        user:users(id, email, role)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Associar relatórios ao cliente
  static async associateReports(clientId: string, reportIds: string[]): Promise<void> {
    const associations = reportIds.map(reportId => ({
      client_id: clientId,
      report_id: reportId,
    }));

    const { error } = await supabase
      .from('client_reports')
      .insert(associations);

    if (error) {
      throw new Error(error.message);
    }
  }

  // Atualizar associações de relatórios
  static async updateReportAssociations(clientId: string, reportIds: string[]): Promise<void> {
    // Primeiro, remover todas as associações existentes
    const { error: deleteError } = await supabase
      .from('client_reports')
      .delete()
      .eq('client_id', clientId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    // Depois, criar as novas associações
    if (reportIds.length > 0) {
      await this.associateReports(clientId, reportIds);
    }
  }

  // Buscar relatórios de um cliente
  static async getClientReports(clientId: string) {
    const { data, error } = await supabase
      .from('client_reports')
      .select(`
        *,
        report:reports(*)
      `)
      .eq('client_id', clientId);

    if (error) {
      throw new Error(error.message);
    }

    return data?.map(item => item.report) || [];
  }

  // Buscar estatísticas dos clientes
  static async getClientsStats() {
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, is_active');

    if (clientsError) {
      throw new Error(clientsError.message);
    }

    const totalClients = clients?.length || 0;
    const activeClients = clients?.filter(c => c.is_active).length || 0;

    return {
      total_clients: totalClients,
      active_clients: activeClients,
      inactive_clients: totalClients - activeClients,
    };
  }
}