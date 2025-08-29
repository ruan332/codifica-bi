import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader } from './Card';
import { Button } from './Button';
import { Input, Select, Textarea } from './Input';
import type { Client, ClientFormData, Report } from '../types';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<void>;
  client?: Client | null;
  reports: Report[];
}

export function ClientFormModal({ isOpen, onClose, onSubmit, client, reports }: ClientFormModalProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    cnpj: '',
    email: '',
    password: '',
    is_active: true,
    report_ids: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Resetar formulário quando modal abrir/fechar ou cliente mudar
  useEffect(() => {
    if (isOpen) {
      if (client) {
        setFormData({
          name: client.name,
          cnpj: client.cnpj,
          email: client.user?.email || '',
          password: '', // Não preencher senha para edição
          is_active: client.is_active,
          report_ids: [], // TODO: Buscar relatórios associados
        });
      } else {
        setFormData({
          name: '',
          cnpj: '',
          email: '',
          password: '',
          is_active: true,
          report_ids: [],
        });
      }
      setError('');
    }
  }, [isOpen, client]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpar erro quando usuário começar a digitar
    if (error) setError('');
  };

  const handleReportSelection = (reportId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      report_ids: checked
        ? [...prev.report_ids, reportId]
        : prev.report_ids.filter(id => id !== reportId)
    }));
  };

  const formatCNPJ = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setFormData(prev => ({ ...prev, cnpj: formatted }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    
    if (!formData.cnpj.trim()) {
      setError('CNPJ é obrigatório');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    
    if (!client && !formData.password.trim()) {
      setError('Senha é obrigatória para novos clientes');
      return false;
    }
    
    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email deve ter um formato válido');
      return false;
    }
    
    // Validar CNPJ (básico)
    const cnpjNumbers = formData.cnpj.replace(/\D/g, '');
    if (cnpjNumbers.length !== 14) {
      setError('CNPJ deve ter 14 dígitos');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Limpar formatação do CNPJ antes de enviar
      const dataToSubmit = {
        ...formData,
        cnpj: formData.cnpj.replace(/\D/g, ''),
      };
      
      await onSubmit(dataToSubmit);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar cliente';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              {client ? 'Editar Cliente' : 'Novo Cliente'}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
              disabled={loading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome da Empresa"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nome da empresa"
                disabled={loading}
              />
              
              <Input
                label="CNPJ"
                name="cnpj"
                type="text"
                required
                value={formData.cnpj}
                onChange={handleCNPJChange}
                placeholder="00.000.000/0000-00"
                disabled={loading}
                maxLength={18}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@empresa.com"
                disabled={loading}
              />
              
              <Input
                label={client ? 'Nova Senha (opcional)' : 'Senha'}
                name="password"
                type="password"
                required={!client}
                value={formData.password}
                onChange={handleInputChange}
                placeholder={client ? 'Deixe em branco para manter' : 'Senha do usuário'}
                disabled={loading}
                helperText={client ? 'Deixe em branco para manter a senha atual' : undefined}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                disabled={loading}
                className="rounded border-slate-300 text-slate-800 focus:ring-slate-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                Cliente ativo
              </label>
            </div>
            
            {/* Seleção de Relatórios */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Relatórios Disponíveis
              </label>
              {reports.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-md p-3">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`report-${report.id}`}
                        checked={formData.report_ids.includes(report.id)}
                        onChange={(e) => handleReportSelection(report.id, e.target.checked)}
                        disabled={loading}
                        className="rounded border-slate-300 text-slate-800 focus:ring-slate-500"
                      />
                      <label 
                        htmlFor={`report-${report.id}`} 
                        className="text-sm text-slate-700 flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{report.title}</div>
                        {report.description && (
                          <div className="text-xs text-slate-500 truncate">
                            {report.description}
                          </div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  Nenhum relatório disponível. Crie relatórios primeiro.
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={loading}
              >
                {client ? 'Atualizar' : 'Criar'} Cliente
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}