
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AvatarUpload } from '@/components/AvatarUpload';
import { User } from '@/types/user';

// Create dynamic schema based on whether we're editing or creating
const createUserSchema = (isEditing: boolean) => z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'procurement_manager', 'procurement_engineer', 'viewer']),
  department: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']),
  phone: z.string().optional(),
  password: isEditing 
    ? z.string().optional() 
    : z.string().optional().refine((val) => !val || val.length >= 6, {
        message: 'Password must be at least 6 characters',
      }),
  avatar: z.string().optional(),
});

type UserFormData = z.infer<ReturnType<typeof createUserSchema>>;

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar || null);

  const form = useForm<UserFormData>({
    resolver: zodResolver(createUserSchema(!!user)),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'viewer',
      department: user?.department || 'General',
      status: user?.status || 'active',
      phone: user?.phone || '',
      password: '',
      avatar: user?.avatar || '',
    },
  });

  const handleSubmit = async (data: UserFormData) => {
    try {
      const submitData = {
        ...data,
        avatar: avatarUrl || undefined,
      };
      await onSubmit(submitData);
    } catch (error) {
      // Re-throw error to ensure it's properly handled
      throw error;
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        {/* Avatar Upload Section */}
        <div className="flex justify-center">
          <AvatarUpload
            currentAvatar={avatarUrl || undefined}
            name={form.watch('name') || 'User'}
            onAvatarChange={setAvatarUrl}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="procurement_manager">Procurement Manager</SelectItem>
                    <SelectItem value="procurement_engineer">Procurement Engineer</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input placeholder="Enter department" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!user && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Temporary Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter temporary password" {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use default password (TempPassword123!). User should change it on first login.
                  </p>
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={form.formState.isSubmitting} 
            className="w-full sm:w-auto"
          >
            {form.formState.isSubmitting 
              ? (user ? 'Updating...' : 'Creating...') 
              : (user ? 'Update User' : 'Create User')
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
