
import React from 'react';
import { usePersistentFormState, PersistentFormOptions } from '@/hooks/persistent-form';

interface PersistentFormProps<T extends Record<string, any>> {
  initialValues: T;
  options?: PersistentFormOptions;
  children: (formState: ReturnType<typeof usePersistentFormState<T>>) => React.ReactNode;
  className?: string;
  onSubmit?: (values: T) => void;
}

export function PersistentForm<T extends Record<string, any>>({
  initialValues,
  options,
  children,
  className,
  onSubmit
}: PersistentFormProps<T>) {
  const formState = usePersistentFormState(initialValues, options);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formState.formValues);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children(formState)}
    </form>
  );
}
