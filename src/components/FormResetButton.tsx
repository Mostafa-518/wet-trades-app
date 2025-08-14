
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface FormResetButtonProps {
  onReset: () => void;
  hasData?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function FormResetButton({
  onReset,
  hasData = true,
  variant = 'outline',
  size = 'default',
  className,
  children
}: FormResetButtonProps) {
  if (!hasData) return null;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onReset}
      className={className}
    >
      <RotateCcw className="h-4 w-4 mr-2" />
      {children || 'Reset Form'}
    </Button>
  );
}
