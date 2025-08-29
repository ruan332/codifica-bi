import React from 'react';
import { Alert } from './Alert';
import { AlertItem } from '../hooks/useAlert';

interface AlertContainerProps {
  alerts: AlertItem[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

const positionClasses = {
  'top-right': 'fixed top-4 right-4 z-50',
  'top-left': 'fixed top-4 left-4 z-50',
  'bottom-right': 'fixed bottom-4 right-4 z-50',
  'bottom-left': 'fixed bottom-4 left-4 z-50',
  'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
  'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
};

export function AlertContainer({
  alerts,
  onDismiss,
  position = 'top-right',
  className = '',
}: AlertContainerProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className={`${positionClasses[position]} ${className}`}>
      <div className="space-y-3 max-w-sm w-full">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="transform transition-all duration-300 ease-in-out"
          >
            <Alert
              variant={alert.variant}
              title={alert.title}
              dismissible={alert.dismissible}
              onDismiss={() => onDismiss(alert.id)}
              icon={true}
              actions={alert.actions}
              className="shadow-lg"
            >
              {alert.message}
            </Alert>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente para alertas inline (dentro do conteúdo da página)
interface InlineAlertContainerProps {
  alerts: AlertItem[];
  onDismiss: (id: string) => void;
  className?: string;
}

export function InlineAlertContainer({
  alerts,
  onDismiss,
  className = '',
}: InlineAlertContainerProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.variant}
          title={alert.title}
          dismissible={alert.dismissible}
          onDismiss={() => onDismiss(alert.id)}
          icon={true}
          actions={alert.actions}
        >
          {alert.message}
        </Alert>
      ))}
    </div>
  );
}