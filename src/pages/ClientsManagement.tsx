import React, { useState } from 'react';
import { Plus, Edit, Trash2, UserCheck, UserX, Search, Eye } from 'lucide-react';
import { useClients } from '../hooks/useClients';
import { useReports } from '../hooks/useReports';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { PageLoading } from '../components/Loading';
import { ClientFormModal } from '../components/ClientFormModal';
import type { Client, ClientFormData } from '../types';

export function ClientsManagement() {
  const { clients, loading, error, createClient, updateClient, deleteClient, toggleClientStatus } = useClients();
  const { reports } = useReports();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // Filtrar clientes
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cnpj.includes(searchTerm) ||
      client.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && client.is_active) ||
      (statusFilter === 'inactive' && !client.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateClient = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    setDeletingClient(client);
  };

  const confirmDelete = async () => {
    if (!deletingClient) return;
    
    try {
      await deleteClient(deletingClient.id);
      setDeletingClient(null);
    } catch (err) {
      console.error('Erro ao deletar cliente:', err);
    }
  };

  const handleToggleStatus = async (client: Client) => {
    try {
      await toggleClientStatus(client.id, !client.is_active);
    } catch (err) {
      console.error('Erro ao alterar status:', err);
    }
  };

  const handleSubmitForm = async (data: ClientFormData) => {
    try {
      if (editingClient) {
        await updateClient(editingClient.id, data);
      } else {
        await createClient(data);
      }
      setIsModalOpen(false);
      setEditingClient(null);
    } catch (err) {
      throw err; // Re-throw para o modal tratar
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  if (loading) {
    return <PageLoading text="Carregando clientes..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Gerenciamento de Clientes
          </h1>
          <p className="mt-2 text-slate-600">
            Gerencie clientes e suas permissões de acesso
          </p>
        </div>
        <Button onClick={handleCreateClient}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome, CNPJ ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                options={[
                  { value: 'all', label: 'Todos os status' },
                  { value: 'active', label: 'Apenas ativos' },
                  { value: 'inactive', label: 'Apenas inativos' },
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-slate-400 mb-4">
              {searchTerm || statusFilter !== 'all' ? (
                <Search className="h-12 w-12 mx-auto" />
              ) : (
                <Plus className="h-12 w-12 mx-auto" />
              )}
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'Nenhum cliente encontrado' 
                : 'Nenhum cliente cadastrado'
              }
            </h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando seu primeiro cliente.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={handleCreateClient}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Cliente
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      client.is_active ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {client.is_active ? (
                        <UserCheck className="h-6 w-6 text-green-600" />
                      ) : (
                        <UserX className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {client.name}
                      </h3>
                      <div className="text-sm text-slate-600 space-y-1">
                        <p>CNPJ: {formatCNPJ(client.cnpj)}</p>
                        <p>Email: {client.user?.email}</p>
                        <p>Criado em: {formatDate(client.created_at)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      client.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {client.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(client)}
                    >
                      {client.is_active ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClient(client)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClient(client)}
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

      {/* Stats */}
      {clients.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-slate-900">
                {clients.length}
              </div>
              <div className="text-sm text-slate-600">
                Total de Clientes
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-green-600">
                {clients.filter(c => c.is_active).length}
              </div>
              <div className="text-sm text-slate-600">
                Clientes Ativos
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-red-600">
                {clients.filter(c => !c.is_active).length}
              </div>
              <div className="text-sm text-slate-600">
                Clientes Inativos
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Client Form Modal */}
      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        onSubmit={handleSubmitForm}
        client={editingClient}
        reports={reports}
      />

      {/* Delete Confirmation Modal */}
      {deletingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">
                Confirmar Exclusão
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-6">
                Tem certeza que deseja excluir o cliente <strong>{deletingClient.name}</strong>? 
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setDeletingClient(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmDelete}
                >
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}