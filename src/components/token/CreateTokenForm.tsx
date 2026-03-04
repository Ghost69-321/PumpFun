'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card, CardBody } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { CreateTokenFormData } from '@/types';

type FormErrors = Partial<Record<keyof CreateTokenFormData | string, string>>;

export function CreateTokenForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CreateTokenFormData>({
    name: '',
    ticker: '',
    description: '',
    imageUrl: '',
    socialLinks: {},
    initialBuyAmount: 0,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (field: keyof CreateTokenFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        handleChange('imageUrl', data.url);
        setImagePreview(data.url);
      }
    } catch {
      toast({ type: 'error', title: 'Upload failed', description: 'Could not upload image' });
    } finally {
      setUploadingImage(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    else if (form.name.length > 50) newErrors.name = 'Name must be 50 characters or less';

    if (!form.ticker.trim()) newErrors.ticker = 'Ticker is required';
    else if (!/^[A-Z0-9]+$/i.test(form.ticker)) newErrors.ticker = 'Ticker must be alphanumeric';
    else if (form.ticker.length > 10) newErrors.ticker = 'Ticker must be 10 characters or less';

    if (form.description && form.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast({ type: 'error', title: 'Not connected', description: 'Please connect your wallet first' });
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          ticker: form.ticker.toUpperCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ type: 'error', title: 'Failed to create token', description: data.error });
        return;
      }

      toast({
        type: 'success',
        title: '🚀 Token launched!',
        description: `${form.name} (${form.ticker.toUpperCase()}) is live!`,
      });
      router.push(`/token/${data.id}`);
    } catch {
      toast({ type: 'error', title: 'Error', description: 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image upload */}
      <Card variant="bordered">
        <CardBody>
          <p className="text-text-secondary text-sm font-medium mb-3">Token Image</p>
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-xl bg-surface-3 border-2 border-dashed border-border hover:border-accent/50 cursor-pointer flex items-center justify-center overflow-hidden transition-colors"
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Token preview" className="w-full h-full object-cover" />
              ) : uploadingImage ? (
                <svg className="animate-spin w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <div className="text-center">
                  <p className="text-2xl">📷</p>
                </div>
              )}
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                loading={uploadingImage}
              >
                Upload Image
              </Button>
              <p className="text-text-muted text-xs mt-1">PNG, JPG, GIF up to 5MB</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />
        </CardBody>
      </Card>

      {/* Basic info */}
      <Card variant="bordered">
        <CardBody className="space-y-4">
          <p className="text-text-secondary text-sm font-medium">Token Details</p>

          <Input
            label="Token Name *"
            placeholder="e.g. Dogwifhat"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            maxLength={50}
          />

          <Input
            label="Ticker Symbol *"
            placeholder="e.g. WIF"
            value={form.ticker}
            onChange={(e) => handleChange('ticker', e.target.value.toUpperCase())}
            error={errors.ticker}
            maxLength={10}
            hint="3-10 uppercase letters/numbers"
          />

          <Textarea
            label="Description"
            placeholder="Tell the world about your token..."
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={errors.description}
            maxLength={500}
            rows={3}
          />
        </CardBody>
      </Card>

      {/* Social links */}
      <Card variant="bordered">
        <CardBody className="space-y-4">
          <p className="text-text-secondary text-sm font-medium">Social Links (optional)</p>

          <Input
            label="Twitter / X"
            placeholder="https://twitter.com/yourtoken"
            value={form.socialLinks?.twitter || ''}
            onChange={(e) => handleSocialChange('twitter', e.target.value)}
            leftAddon="🐦"
          />
          <Input
            label="Telegram"
            placeholder="https://t.me/yourtoken"
            value={form.socialLinks?.telegram || ''}
            onChange={(e) => handleSocialChange('telegram', e.target.value)}
            leftAddon="✈️"
          />
          <Input
            label="Website"
            placeholder="https://yourtoken.io"
            value={form.socialLinks?.website || ''}
            onChange={(e) => handleSocialChange('website', e.target.value)}
            leftAddon="🌐"
          />
        </CardBody>
      </Card>

      {/* Initial buy */}
      <Card variant="bordered">
        <CardBody>
          <p className="text-text-secondary text-sm font-medium mb-3">Initial Buy (optional)</p>
          <Input
            label="Buy amount in SOL"
            type="number"
            step="0.01"
            min="0"
            max="10"
            placeholder="0.0"
            value={form.initialBuyAmount || ''}
            onChange={(e) => handleChange('initialBuyAmount', Number(e.target.value))}
            rightAddon="SOL"
            hint="Buy tokens immediately upon launch (max 10 SOL)"
          />
        </CardBody>
      </Card>

      {/* Disclaimer */}
      <div className="bg-yellow/10 border border-yellow/20 rounded-lg p-3">
        <p className="text-yellow text-xs">
          ⚠️ Creating a token costs 0.02 SOL. Ensure you have sufficient balance.
          All tokens use a fair-launch bonding curve with no pre-mint allocation.
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        disabled={!session}
        className="w-full"
      >
        {session ? '🚀 Launch Token' : '🔒 Connect Wallet to Launch'}
      </Button>
    </form>
  );
}
