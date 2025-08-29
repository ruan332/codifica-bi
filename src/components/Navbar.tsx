import React from 'react';
import { cn } from '../lib/utils';

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

export function Navbar({ children, className }: NavbarProps) {
  return (
    <nav className={cn(
      'flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3',
      className
    )}>
      {children}
    </nav>
  );
}

interface NavbarItemProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  current?: boolean;
  'aria-label'?: string;
  onClick?: () => void;
}

export const NavbarItem = React.forwardRef<HTMLElement, NavbarItemProps>(({ 
  children, 
  className, 
  href, 
  current = false,
  onClick,
  ...props 
}, ref) => {
  const Component = href ? 'a' : 'button';
  const linkProps = href ? { href } : { onClick };

  return (
    <Component
      ref={ref as any}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        current 
          ? 'bg-blue-50 text-blue-700' 
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        className
      )}
      {...linkProps}
      {...props}
    >
      {children}
    </Component>
  );
});

NavbarItem.displayName = 'NavbarItem';

interface NavbarSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function NavbarSection({ children, className }: NavbarSectionProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {children}
    </div>
  );
}

interface NavbarLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function NavbarLabel({ children, className }: NavbarLabelProps) {
  return (
    <span className={cn('text-sm font-medium', className)}>
      {children}
    </span>
  );
}

export function NavbarSpacer({ className }: { className?: string }) {
  return <div className={cn('flex-1', className)} />;
}

export function NavbarDivider({ className }: { className?: string }) {
  return (
    <div className={cn('mx-2 h-6 w-px bg-gray-300', className)} />
  );
}