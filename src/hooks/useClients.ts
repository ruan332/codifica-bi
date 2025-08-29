import { useState, useEffect, useCallback } from 'react';
import { ClientsService } from '../services/clients';
import type { Client, ClientFormData, UseClientsReturn } from '../types';

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar clientes
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ClientsService.getClients();
      setClients(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar clientes';
      setError(errorMessage);
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar clientes ao inicializar
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Criar cliente
  const createClient = useCallback(async (data: ClientFormData) => {
    try {
      setError(null);
      const newClient = await ClientsService.createClient(data);
      setClients(prev => [newClient, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar cliente';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Atualizar cliente
  const updateClient = useCallback(async (id: string, data: Partial<ClientFormData>) => {
    try {
      setError(null);
      const updatedClient = await ClientsService.updateClient(id, data);
      setClients(prev => 
        prev.map(client => 
          client.id === id ? updatedClient : client
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar cliente';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Deletar cliente
  const deleteClient = useCallback(async (id: string) => {
    try {
      setError(null);
      await ClientsService.deleteClient(id);
      setClients(prev => prev.filter(client => client.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar cliente';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Alternar status do cliente
  const toggleClientStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      setError(null);
      const updatedClient = await ClientsService.toggleClientStatus(id, isActive);
      setClients(prev => 
        prev.map(client => 
          client.id === id ? updatedClient : client
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar status do cliente';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Recarregar dados
  const refetch = useCallback(async () => {
    await fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    toggleClientStatus,
    refetch,
  };
}