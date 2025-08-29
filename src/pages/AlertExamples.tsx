import React from 'react';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { useAlert } from '../hooks/useAlert';
import { InlineAlertContainer } from '../components/AlertContainer';
import {
  Alert,
  SuccessAlert,
  ErrorAlert,
  WarningAlert,
  InfoAlert,
  AlertList,
  AlertWithDescription
} from '../components/Alert';

export function AlertExamples() {
  const { alerts, removeAlert, showSuccess, showError, showWarning, showInfo } = useAlert();

  const handleShowSuccess = () => {
    showSuccess('Operação realizada com sucesso!');
  };

  const handleShowError = () => {
    showError('Ocorreu um erro ao processar a solicitação.');
  };

  const handleShowWarning = () => {
    showWarning('Atenção: Esta ação pode ter consequências importantes.');
  };

  const handleShowInfo = () => {
    showInfo('Informação: Novos recursos foram adicionados ao sistema.');
  };

  const handleShowWithActions = () => {
    showError('Erro de conexão com o servidor.', {
      actions: (
        <div className="flex space-x-2">
          <button
            onClick={() => console.log('Tentando novamente...')}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Tentar Novamente
          </button>
          <button
            onClick={() => console.log('Cancelado')}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Cancelar
          </button>
        </div>
      )
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Exemplos de Alertas
        </h1>
        <p className="mt-2 text-slate-600">
          Demonstração dos diferentes tipos de alertas disponíveis no sistema
        </p>
      </div>

      {/* Alertas Dinâmicos */}
      <InlineAlertContainer
        alerts={alerts}
        onDismiss={removeAlert}
        className="mb-8"
      />

      {/* Botões para Testar Alertas */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold text-slate-900">
            Alertas Dinâmicos
          </h2>
          <p className="text-slate-600">
            Clique nos botões abaixo para testar os diferentes tipos de alertas
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={handleShowSuccess}
              className="bg-green-600 hover:bg-green-700"
            >
              Sucesso
            </Button>
            <Button
              onClick={handleShowError}
              className="bg-red-600 hover:bg-red-700"
            >
              Erro
            </Button>
            <Button
              onClick={handleShowWarning}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Aviso
            </Button>
            <Button
              onClick={handleShowInfo}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Informação
            </Button>
          </div>
          <div className="mt-4">
            <Button
              onClick={handleShowWithActions}
              variant="outline"
              className="w-full"
            >
              Alerta com Ações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alertas Estáticos - Exemplos */}
      <div className="space-y-8">
        {/* Alertas Básicos */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-slate-900">
              Alertas Básicos
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <SuccessAlert title="Sucesso">
              Sua operação foi concluída com sucesso!
            </SuccessAlert>
            
            <ErrorAlert title="Erro">
              Ocorreu um erro ao processar sua solicitação.
            </ErrorAlert>
            
            <WarningAlert title="Atenção">
              Esta ação não pode ser desfeita.
            </WarningAlert>
            
            <InfoAlert title="Informação">
              Novos recursos estão disponíveis.
            </InfoAlert>
          </CardContent>
        </Card>

        {/* Alertas com Bordas */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-slate-900">
              Alertas com Bordas
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="success" style="bordered" title="Sucesso com Borda">
              Operação realizada com sucesso!
            </Alert>
            
            <Alert variant="error" style="bordered" title="Erro com Borda">
              Falha na operação.
            </Alert>
            
            <Alert variant="warning" style="bordered" title="Aviso com Borda">
              Verifique os dados antes de continuar.
            </Alert>
            
            <Alert variant="info" style="bordered" title="Info com Borda">
              Sistema será atualizado em breve.
            </Alert>
          </CardContent>
        </Card>

        {/* Alertas Suaves */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-slate-900">
              Alertas Suaves
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="success" style="soft" title="Sucesso Suave">
              Configurações salvas automaticamente.
            </Alert>
            
            <Alert variant="error" style="soft" title="Erro Suave">
              Alguns campos são obrigatórios.
            </Alert>
            
            <Alert variant="warning" style="soft" title="Aviso Suave">
              Conexão instável detectada.
            </Alert>
            
            <Alert variant="info" style="soft" title="Info Suave">
              Dica: Use Ctrl+S para salvar rapidamente.
            </Alert>
          </CardContent>
        </Card>

        {/* Alertas com Lista */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-slate-900">
              Alertas com Lista
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <AlertList
              variant="error"
              title="Erros de Validação"
              items={[
                'O campo nome é obrigatório',
                'O email deve ter um formato válido',
                'A senha deve ter pelo menos 8 caracteres'
              ]}
            />
            
            <AlertList
              variant="warning"
              title="Itens que Precisam de Atenção"
              items={[
                'Backup não realizado há 7 dias',
                'Certificado SSL expira em 30 dias',
                'Espaço em disco com 85% de uso'
              ]}
            />
          </CardContent>
        </Card>

        {/* Alertas com Descrição */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-slate-900">
              Alertas com Descrição
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <AlertWithDescription
              variant="success"
              title="Deploy Realizado"
              description="A nova versão da aplicação foi implantada com sucesso em produção. Todas as funcionalidades estão operacionais."
            >
              Deploy concluído
            </AlertWithDescription>
            
            <AlertWithDescription
              variant="info"
              title="Manutenção Programada"
              description="O sistema passará por manutenção no domingo das 02:00 às 06:00. Durante este período, algumas funcionalidades podem ficar indisponíveis."
            >
              Manutenção agendada
            </AlertWithDescription>
          </CardContent>
        </Card>

        {/* Alertas com Ações */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-slate-900">
              Alertas com Ações
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert
              variant="warning"
              title="Confirmação Necessária"
              actions={
                <div className="flex space-x-2">
                  <button
                    onClick={() => alert('Confirmado!')}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => alert('Cancelado!')}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              }
            >
              Tem certeza que deseja excluir este item?
            </Alert>
            
            <Alert
              variant="info"
              title="Atualização Disponível"
              actions={
                <div className="flex space-x-2">
                  <button
                    onClick={() => alert('Atualizando...')}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Atualizar Agora
                  </button>
                  <button
                    onClick={() => alert('Lembrete definido!')}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Lembrar Depois
                  </button>
                </div>
              }
            >
              Uma nova versão está disponível com melhorias de performance.
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}