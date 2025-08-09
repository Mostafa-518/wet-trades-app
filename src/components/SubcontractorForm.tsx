
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { Subcontractor, SubcontractorFormData } from '@/types/subcontractor';
import { SubcontractorFormHeader } from './subcontractor-form/SubcontractorFormHeader';
import { SubcontractorFormFields } from './subcontractor-form/SubcontractorFormFields';
import { SubcontractorFormActions } from './subcontractor-form/SubcontractorFormActions';

const formSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  representativeName: z.string().min(1, 'Representative name is required'),
  commercialRegistration: z.string().min(1, 'Commercial registration is required'),
  taxCardNo: z.string().min(1, 'Tax card number is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
});

interface SubcontractorFormProps {
  subcontractor?: Subcontractor;
  onSubmit: (data: SubcontractorFormData) => void;
  onCancel: () => void;
}

export function SubcontractorForm({ subcontractor, onSubmit, onCancel }: SubcontractorFormProps) {
  const form = useForm<SubcontractorFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: subcontractor?.companyName || '',
      representativeName: subcontractor?.representativeName || '',
      commercialRegistration: subcontractor?.commercialRegistration || '',
      taxCardNo: subcontractor?.taxCardNo || '',
      email: subcontractor?.email || '',
      phone: subcontractor?.phone || '',
    },
  });

  const handleSubmit = (data: SubcontractorFormData) => {
    onSubmit(data);
  };

  return (
    <div className="space-y-6">
      <SubcontractorFormHeader subcontractor={subcontractor} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <SubcontractorFormFields control={form.control} />
          <SubcontractorFormActions subcontractor={subcontractor} onCancel={onCancel} />
        </form>
      </Form>
    </div>
  );
}
