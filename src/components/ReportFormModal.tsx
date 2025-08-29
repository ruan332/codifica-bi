import React, { useState, useEffect } from 'react';
import { X, FileText, Link, Code, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Input, Textarea } from './Input';
import type { Report, ReportFormData } from '../types';

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReportFormData) => Promise<void>;
  report?: Report | null;
  loading?: boolean;
}

export function ReportFormModal({
  isOpen,
  onClose,
  onSubmit,
  report,
  loading = false,
}: ReportFormModalProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    title: '',
    description: '',
    power_bi_url: '',
    iframe_code: '',
  });
  const [errors, setErrors] = useState<Partial<ReportFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resetar formulário quando modal abrir/fechar ou report mudar
  useEffect(() => {
    if (isOpen) {
      if (report) {
        // Modo edição
        setFormData({
          title: report.title,
          description: report.description || '',
          power_bi_url: report.power_bi_url,
          iframe_code: report.iframe_code,
        });
      } else {
        // Modo criação
        setFormData({
          title: '',
          description: '',
          power_bi_url: '',
          iframe_code: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, report]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ReportFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.power_bi_url.trim()) {
      newErrors.power_bi_url = 'URL do Power BI é obrigatória';
    } else {
      // Validação básica de URL
      try {
        new URL(formData.power_bi_url);
      } catch {
        newErrors.power_bi_url = 'URL inválida';
      }
    }

    if (!formData.iframe_code.trim()) {
      newErrors.iframe_code = 'Código do iframe é obrigatório';
    } else {
      // Validação básica do iframe
      if (!formData.iframe_code.includes('<iframe') || !formData.iframe_code.includes('</iframe>')) {
        newErrors.iframe_code = 'Código do iframe deve conter tags <iframe> válidas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ReportFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {report ? 'Editar Relatório' : 'Novo Relatório'}
              </h2>
              <p className="text-sm text-slate-600">
                {report ? 'Atualize as informações do relatório' : 'Preencha os dados para criar um novo relatório'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Título *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Digite o título do relatório"
              error={errors.title}
              disabled={isSubmitting}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descrição
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva o conteúdo e objetivo do relatório"
              rows={3}
              error={errors.description}
              disabled={isSubmitting}
            />
          </div>

          {/* URL do Power BI */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center space-x-2">
                <Link className="h-4 w-4" />
                <span>URL do Power BI *</span>
              </div>
            </label>
            <Input
              type="url"
              value={formData.power_bi_url}
              onChange={(e) => handleInputChange('power_bi_url', e.target.value)}
              placeholder="https://app.powerbi.com/..."
              error={errors.power_bi_url}
              disabled={isSubmitting}
            />
            <p className="text-xs text-slate-500 mt-1">
              URL completa do relatório no Power BI
            </p>
          </div>

          {/* Código do Iframe */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span>Código do Iframe *</span>
              </div>
            </label>
            <Textarea
              value={formData.iframe_code}
              onChange={(e) => handleInputChange('iframe_code', e.target.value)}
              placeholder='<iframe title="Relatório" width="100%" height="600" src="https://app.powerbi.com/..." frameborder="0" allowFullScreen="true"></iframe>'
              rows={6}
              error={errors.iframe_code}
              disabled={isSubmitting}
              className="font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Código HTML do iframe fornecido pelo Power BI
            </p>
          </div>

          {/* Aviso sobre segurança */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-amber-800 mb-1">
                  Importante sobre segurança
                </h4>
                <p className="text-sm text-amber-700">
                  Certifique-se de que o código do iframe seja proveniente de uma fonte confiável. 
                  Códigos maliciosos podem comprometer a segurança da aplicação.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={loading}
          >
            {report ? 'Atualizar' : 'Criar'} Relatório
          </Button>
        </div>
      </div>
    </div>
  );
}