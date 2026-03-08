import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2 } from 'lucide-react';
import { updateUserKyc } from '@/lib/supabase-services';

const KYC_API_URL = import.meta.env.VITE_KYC_API_URL || 'http://localhost:8000';

export interface VerifyResult {
  status: 'approved' | 'manual_review';
  confidence: number;
  ocr_text: string[];
  message?: string;
}

interface KycUploadFormProps {
  userId: string;
  onSuccess: () => void;
  onError?: (error: Error | string) => void;
}

const KycUploadForm: React.FC<KycUploadFormProps> = ({ userId, onSuccess, onError }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [idCard, setIdCard] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCard || !selfie) {
      toast({
        title: t('common.error'),
        description: t('verifyIdentity.uploadBoth', 'Please upload both ID card and selfie'),
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('id_card', idCard);
      formData.append('selfie', selfie);

      const res = await fetch(`${KYC_API_URL}/verify`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data: VerifyResult = await res.json();

      if (data.status === 'approved') {
        await updateUserKyc(userId, {
          verification_status: 'verified',
          kyc_confidence: data.confidence,
          kyc_data: { ocr_text: data.ocr_text, status: data.status },
          verified: true,
        });
        toast({
          title: t('verifyIdentity.successTitle', 'Verification successful'),
          description: t('verifyIdentity.successDesc', 'Your identity has been verified.'),
        });
        onSuccess();
      } else {
        await updateUserKyc(userId, {
          verification_status: 'pending',
          kyc_confidence: data.confidence,
          kyc_data: { ocr_text: data.ocr_text, status: data.status },
        });
        toast({
          title: t('verifyIdentity.pendingTitle', 'Under review'),
          description: t('verifyIdentity.pendingDesc', 'Your documents were received and will be reviewed shortly.'),
        });
        onSuccess();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: t('common.error'),
        description: message || t('verifyIdentity.failed', 'Verification failed'),
        variant: 'destructive',
      });
      onError?.(err instanceof Error ? err : new Error(message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('verifyIdentity.idCard', 'ID Card')}
        </label>
        <input
          type="file"
          accept="image/*"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-sage-green/20 file:text-medium-jungle dark:file:bg-sage-green/30 dark:file:text-sage-green"
          onChange={(e) => setIdCard(e.target.files?.[0] ?? null)}
          disabled={submitting}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('verifyIdentity.selfie', 'Selfie')}
        </label>
        <input
          type="file"
          accept="image/*"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-sage-green/20 file:text-medium-jungle dark:file:bg-sage-green/30 dark:file:text-sage-green"
          onChange={(e) => setSelfie(e.target.files?.[0] ?? null)}
          disabled={submitting}
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="w-full bg-medium-jungle hover:bg-medium-jungle/90 text-white"
        disabled={submitting || !idCard || !selfie}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t('common.loading', 'Verifying...')}
          </>
        ) : (
          <>
            <Upload className="mr-2 h-5 w-5" />
            {t('verifyIdentity.verifyButton', 'Verify Identity')}
          </>
        )}
      </Button>
    </form>
  );
};

export default KycUploadForm;
