import { useState, useCallback, useRef, useEffect } from 'react';
import { AlertVariant } from '../components/Alert';

export interface AlertItem {
  id: string;
  variant: AlertVariant;
  title?: string;
  message: string;
  dismissible?: boolean;
  autoClose?: boolean;
  duration?: number; // em milissegundos
  actions?: React.ReactNode;
}

export interface UseAlertReturn {
  alerts: AlertItem[];
  addAlert: (alert: Omit<AlertItem, 'id'>) => string;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
  showSuccess: (message: string, options?: Partial<AlertItem>) => string;
  showError: (message: string, options?: Partial<AlertItem>) => string;
  showWarning: (message: string, options?: Partial<AlertItem>) => string;
  showInfo: (message: string, options?: Partial<AlertItem>) => string;
}

let alertIdCounter = 0;

export function useAlert(): UseAlertReturn {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const generateId = useCallback(() => {
    alertIdCounter += 1;
    return `alert-${alertIdCounter}-${Date.now()}`;
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    
    // Limpar timeout se existir
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const addAlert = useCallback((alertData: Omit<AlertItem, 'id'>) => {
    const id = generateId();
    const alert: AlertItem = {
      id,
      dismissible: true,
      autoClose: true,
      duration: 5000, // 5 segundos por padrão
      ...alertData,
    };

    setAlerts(prev => [...prev, alert]);

    // Configurar auto-close se habilitado
    if (alert.autoClose && alert.duration) {
      const timeout = setTimeout(() => {
        removeAlert(id);
      }, alert.duration);
      
      timeoutsRef.current.set(id, timeout);
    }

    return id;
  }, [generateId, removeAlert]);

  const clearAlerts = useCallback(() => {
    // Limpar todos os timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
    
    setAlerts([]);
  }, []);

  const showSuccess = useCallback((message: string, options: Partial<AlertItem> = {}) => {
    return addAlert({
      variant: 'success',
      message,
      ...options,
    });
  }, [addAlert]);

  const showError = useCallback((message: string, options: Partial<AlertItem> = {}) => {
    return addAlert({
      variant: 'error',
      message,
      autoClose: false, // Erros não fecham automaticamente por padrão
      ...options,
    });
  }, [addAlert]);

  const showWarning = useCallback((message: string, options: Partial<AlertItem> = {}) => {
    return addAlert({
      variant: 'warning',
      message,
      duration: 7000, // Warnings ficam um pouco mais tempo
      ...options,
    });
  }, [addAlert]);

  const showInfo = useCallback((message: string, options: Partial<AlertItem> = {}) => {
    return addAlert({
      variant: 'info',
      message,
      ...options,
    });
  }, [addAlert]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}

// Hook para usar alertas globais (pode ser usado com Context)
export function useGlobalAlert() {
  // Este hook pode ser expandido para usar um contexto global
  // Por enquanto, retorna o hook local
  return useAlert();
}