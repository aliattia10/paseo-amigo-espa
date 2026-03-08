import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2 } from 'lucide-react';
import { updateUserKyc } from '@/lib/supabase-services';

// Use proxy in dev to avoid CORS; fallback to direct KYC URL
const getVerifyUrl = () => {
  if (import.meta.env.DEV) return '/api/python/verify';
  return `${import.meta.env.VITE_KYC_API_URL || 'http://localhost:8002'}/verify`;
};

export interface VerifyResult {
  status: 'approved' | 'rejected';
  confidence: number;
  extracted_data: {
    doc_type?: string;
    name?: string | null;
    country?: string | null;
    dob?: string | null;
    expiry?: string | null;
    ocr_text?: string[];
    [key: string]: unknown;
  };
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
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [docType, setDocType] = useState<'id' | 'passport'>('id');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentFile || !selfie) {
      toast({
        title: t('common.error'),
        description: t('verifyIdentity.uploadBoth', 'Please upload both document and selfie'),
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('id_card', documentFile);
      formData.append('selfie', selfie);
      formData.append('doc_type', docType);

      const res = await fetch(getVerifyUrl(), {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data: VerifyResult = await res.json();

      const kycData = {
        status: data.status,
        doc_type: docType,
        extracted_data: data.extracted_data ?? {},
      };

      if (data.status === 'approved') {
        await updateUserKyc(userId, {
          verification_status: 'verified',
          kyc_confidence: data.confidence,
          kyc_data: kycData,
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
          kyc_data: kycData,
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
        <Label>{t('verifyIdentity.docType', 'Document type')}</Label>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value as 'id' | 'passport')}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          disabled={submitting}
        >
          <option value="id">ID Card</option>
          <option value="passport">Passport</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {docType === 'passport' ? t('verifyIdentity.passport', 'Passport') : t('verifyIdentity.idCard', 'ID Card')}
        </Label>
        <input
          type="file"
          accept="image/*"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-sage-green/20 file:text-medium-jungle dark:file:bg-sage-green/30 dark:file:text-sage-green"
          onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
          disabled={submitting}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('verifyIdentity.selfie', 'Selfie')}
        </Label>
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
        disabled={submitting || !documentFile || !selfie}
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
