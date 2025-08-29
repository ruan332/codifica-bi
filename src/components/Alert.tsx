import React, { ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';
export type AlertStyle = 'default' | 'bordered' | 'soft';

interface AlertProps {
  variant?: AlertVariant;
  style?: AlertStyle;
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: boolean;
  actions?: ReactNode;
  className?: string;
}

const variantStyles = {
  success: {
    default: 'bg-green-50 text-green-800 border-green-200',
    bordered: 'bg-green-50 text-green-800 border-l-4 border-green-400',
    soft: 'bg-green-50 text-green-700 border border-green-200',
  },
  error: {
    default: 'bg-red-50 text-red-800 border-red-200',
    bordered: 'bg-red-50 text-red-800 border-l-4 border-red-400',
    soft: 'bg-red-50 text-red-700 border border-red-200',
  },
  warning: {
    default: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    bordered: 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400',
    soft: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  },
  info: {
    default: 'bg-blue-50 text-blue-800 border-blue-200',
    bordered: 'bg-blue-50 text-blue-800 border-l-4 border-blue-400',
    soft: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
};

const iconMap = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const iconColors = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
};

export function Alert({
  variant = 'info',
  style = 'default',
  title,
  children,
  dismissible = false,
  onDismiss,
  icon = false,
  actions,
  className = '',
}: AlertProps) {
  const IconComponent = iconMap[variant];
  const baseClasses = 'rounded-md p-4';
  const variantClasses = variantStyles[variant][style];
  const iconColorClass = iconColors[variant];

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`} role="alert">
      <div className="flex">
        {icon && (
          <div className="flex-shrink-0">
            <IconComponent className={`h-5 w-5 ${iconColorClass}`} aria-hidden="true" />
          </div>
        )}
        <div className={`${icon ? 'ml-3' : ''} flex-1`}>
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
          {actions && (
            <div className="mt-4">
              {actions}
            </div>
          )}
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-opacity-75 ${
                  variant === 'success'
                    ? 'text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50'
                    : variant === 'error'
                    ? 'text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50'
                    : variant === 'warning'
                    ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600 focus:ring-offset-yellow-50'
                    : 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600 focus:ring-offset-blue-50'
                }`}
                onClick={onDismiss}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componentes específicos para cada variante
export function SuccessAlert(props: Omit<AlertProps, 'variant'>) {
  return <Alert {...props} variant="success" />;
}

export function ErrorAlert(props: Omit<AlertProps, 'variant'>) {
  return <Alert {...props} variant="error" />;
}

export function WarningAlert(props: Omit<AlertProps, 'variant'>) {
  return <Alert {...props} variant="warning" />;
}

export function InfoAlert(props: Omit<AlertProps, 'variant'>) {
  return <Alert {...props} variant="info" />;
}

// Componente para lista de alertas
interface AlertListProps extends Omit<AlertProps, 'children'> {
  items: string[];
}

export function AlertList({ items, ...props }: AlertListProps) {
  return (
    <Alert {...props}>
      <ul className="list-disc list-inside space-y-1">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </Alert>
  );
}

// Componente para alerta com descrição
interface AlertWithDescriptionProps extends AlertProps {
  description?: string;
}

export function AlertWithDescription({
  description,
  children,
  ...props
}: AlertWithDescriptionProps) {
  return (
    <Alert {...props}>
      <div>
        <div className="font-medium">{children}</div>
        {description && (
          <div className="mt-2 text-sm opacity-90">{description}</div>
        )}
      </div>
    </Alert>
  );
}