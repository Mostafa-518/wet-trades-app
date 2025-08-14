
import { useCallback } from 'react';
import { FormInputProps, FormSelectProps, FormCheckboxProps, FormSwitchProps, FormRadioProps } from './types';

export function createFormHelpers<T extends Record<string, any>>(
  formValues: T,
  handleChange: (field: keyof T, value: any) => void,
  initialValues: T
) {
  const getInputProps = useCallback((field: keyof T): FormInputProps => ({
    value: String(formValues[field] || ''),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
      handleChange(field, e.target.value)
  }), [formValues, handleChange]);

  const getSelectProps = useCallback((field: keyof T): FormSelectProps => ({
    value: String(formValues[field] || ''),
    onValueChange: (value: string) => handleChange(field, value)
  }), [formValues, handleChange]);

  const getCheckboxProps = useCallback((field: keyof T): FormCheckboxProps => ({
    checked: Boolean(formValues[field]),
    onCheckedChange: (checked: boolean) => handleChange(field, checked)
  }), [formValues, handleChange]);

  const getSwitchProps = useCallback((field: keyof T): FormSwitchProps => ({
    checked: Boolean(formValues[field]),
    onCheckedChange: (checked: boolean) => handleChange(field, checked)
  }), [formValues, handleChange]);

  const getRadioProps = useCallback((field: keyof T, optionValue: string): FormRadioProps => ({
    value: optionValue,
    onValueChange: (value: string) => handleChange(field, value)
  }), [handleChange]);

  const getNumberInputProps = useCallback((field: keyof T) => ({
    value: formValues[field] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      handleChange(field, value === '' ? '' : Number(value));
    }
  }), [formValues, handleChange]);

  const getDateInputProps = useCallback((field: keyof T) => ({
    value: formValues[field] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
      handleChange(field, e.target.value)
  }), [formValues, handleChange]);

  const getMultiSelectProps = useCallback((field: keyof T) => ({
    value: formValues[field] || [],
    onChange: (values: string[]) => handleChange(field, values)
  }), [formValues, handleChange]);

  const clearField = useCallback((field: keyof T) => {
    handleChange(field, initialValues[field]);
  }, [handleChange, initialValues]);

  const clearAllFields = useCallback(() => {
    Object.keys(formValues).forEach(key => {
      handleChange(key as keyof T, initialValues[key as keyof T]);
    });
  }, [formValues, handleChange, initialValues]);

  return {
    getInputProps,
    getSelectProps,
    getCheckboxProps,
    getSwitchProps,
    getRadioProps,
    getNumberInputProps,
    getDateInputProps,
    getMultiSelectProps,
    clearField,
    clearAllFields
  };
}
