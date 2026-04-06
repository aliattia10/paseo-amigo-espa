import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { updateUserKyc } from '@/lib/supabase-services';
import { Loader2, Shield } from 'lucide-react';

interface DiditVerifyButtonProps {
  userId: string;
  onSuccess: () => void;
}

/**
 * Didit ID Verification — enterprise document + liveness flow.
 * @see https://docs.didit.me/core-technology/id-verification/overview
 * Backend session: Supabase Edge Function `didit-create-session` (keeps API key server-side).
 */
const DiditVerifyButton: React.FC<DiditVerifyButtonProps> = ({ userId, onSuccess }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const applyLocalStatus = async (status: string) => {
    const approved = status === 'Approved';
    const declined = status === 'Declined';
    const inReview = status === 'In Review' || status === 'Pending';

    if (approved) {
      await updateUserKyc(userId, {
        verification_status: 'verified',
        verified: true,
        kyc_data: { provider: 'didit', status, note: 'client_sdk' },
      });
      toast({
        title: t('verifyIdentity.successTitle', 'Verification successful'),
        description: t('verifyIdentity.successDesc', 'Your identity has been verified.'),
      });
      onSuccess();
      return;
    }
    if (declined) {
      await updateUserKyc(userId, {
        verification_status: 'rejected',
        verified: false,
        kyc_data: { provider: 'didit', status },
      });
      toast({
        title: t('verifyIdentity.declinedTitle', 'Verification declined'),
        description: t('verifyIdentity.declinedDesc', 'Your verification was not approved. You can try again.'),
        variant: 'destructive',
      });
      onSuccess();
      return;
    }
    if (inReview) {
      await updateUserKyc(userId, {
        verification_status: 'pending_review',
        kyc_data: { provider: 'didit', status },
      });
      toast({
        title: t('verifyIdentity.inReviewTitle', 'Under review'),
        description: t('verifyIdentity.inReviewDesc', 'Your documents are being reviewed.'),
      });
      onSuccess();
      return;
    }
    await updateUserKyc(userId, {
      verification_status: 'pending',
      kyc_data: { provider: 'didit', status },
    });
    onSuccess();
  };

  const handleClick = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: t('common.error'),
          description: t('auth.pleaseLogInAgain', 'Please log in again'),
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('didit-create-session', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {},
      });

      if (error) throw error;
      const verificationUrl = (data as { verification_url?: string })?.verification_url;
      if (!verificationUrl) {
        throw new Error((data as { error?: string })?.error || 'No verification URL');
      }

      const { DiditSdk } = await import('@didit-protocol/sdk-web');
      const sdk = DiditSdk.shared;
      sdk.onComplete = (result) => {
        if (result.type === 'completed' && result.session?.status) {
          void applyLocalStatus(result.session.status);
        } else if (result.type === 'cancelled') {
          toast({
            title: t('common.close', 'Close'),
            description: t('verifyIdentity.cancelled', 'Verification cancelled'),
          });
        } else if (result.type === 'failed') {
          toast({
            title: t('common.error'),
            description: t('verifyIdentity.failed', 'Verification failed'),
            variant: 'destructive',
          });
        }
      };

      await sdk.startVerification({
        url: verificationUrl,
        configuration: { loggingEnabled: import.meta.env.DEV },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({
        title: t('common.error'),
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      className="w-full bg-medium-jungle hover:bg-medium-jungle/90 text-white h-12 text-base font-semibold gap-2"
      onClick={() => void handleClick()}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
      {t('verifyIdentity.diditCta', 'Verify with Didit (recommended)')}
    </Button>
  );
};

export default DiditVerifyButton;
