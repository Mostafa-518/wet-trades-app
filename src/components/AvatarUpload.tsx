
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatar?: string;
  name: string;
  onAvatarChange: (avatarUrl: string | null) => void;
}

export function AvatarUpload({ currentAvatar, name, onAvatarChange }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, we'll just create a preview URL
      // In a real app, you'd upload to Supabase storage
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreview(result);
        onAvatarChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setPreview(null);
    onAvatarChange(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={preview || undefined} alt={name} />
          <AvatarFallback className="text-lg">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        {preview && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemoveAvatar}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="avatar-upload" className="sr-only">
          Upload Avatar
        </Label>
        <Input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('avatar-upload')?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {preview ? 'Change Avatar' : 'Upload Avatar'}
        </Button>
      </div>
    </div>
  );
}
