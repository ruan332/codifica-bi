import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  buttonRef: React.RefObject<HTMLElement>;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown');
  }
  return context;
}

interface DropdownProps {
  children: React.ReactNode;
  className?: string;
}

export function Dropdown({ children, className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, buttonRef }}>
      <div className={cn('relative', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

interface DropdownButtonProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  [key: string]: any;
}

export function DropdownButton({ 
  children, 
  className, 
  as: Component = 'button',
  ...props 
}: DropdownButtonProps) {
  const { isOpen, setIsOpen, buttonRef } = useDropdown();

  return (
    <Component
      ref={buttonRef}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
    </Component>
  );
}

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
  anchor?: 'bottom start' | 'bottom end' | 'top start' | 'top end';
}

export function DropdownMenu({ 
  children, 
  className, 
  anchor = 'bottom start' 
}: DropdownMenuProps) {
  const { isOpen } = useDropdown();

  if (!isOpen) return null;

  const anchorClasses = {
    'bottom start': 'top-full left-0',
    'bottom end': 'top-full right-0',
    'top start': 'bottom-full left-0',
    'top end': 'bottom-full right-0'
  };

  return (
    <div
      className={cn(
        'absolute z-50 mt-1 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5',
        anchorClasses[anchor],
        className
      )}
    >
      {children}
    </div>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}

export function DropdownItem({ children, className, href, onClick }: DropdownItemProps) {
  const { setIsOpen } = useDropdown();
  
  const handleClick = () => {
    onClick?.();
    setIsOpen(false);
  };

  const Component = href ? 'a' : 'button';
  const props = href ? { href } : { onClick: handleClick };

  return (
    <Component
      className={cn(
        'flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700',
        'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

interface DropdownLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownLabel({ children, className }: DropdownLabelProps) {
  return (
    <span className={cn('flex-1', className)}>
      {children}
    </span>
  );
}

export function DropdownDivider({ className }: { className?: string }) {
  return (
    <div className={cn('my-1 h-px bg-gray-200', className)} />
  );
}