import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { CreditCard, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PayoutSetupBanner: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [connectAccount, setConnectAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    loadConnectAccount();
  }, [currentUser]);

  const loadConnectAccount = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('stripe_connect_accounts')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading Connect account:', error);
      }

      setConnectAccount(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show if:
  // - Loading
  // - User dismissed it
  // - Not a walker/sitter
  // - Already fully set up
  if (
    loading ||
    dismissed ||
    !userProfile ||
    (userProfile.user_type !== 'walker' && userProfile.user_type !== 'both') ||
    (connectAccount?.payouts_enabled && connectAccount?.charges_enabled)
  ) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-4 shadow-lg relative mb-4">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="bg-white/20 p-2 rounded-lg">
          <CreditCard className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">
            {connectAccount ? t('payout.complete_setup') : t('payout.setup_payouts')}
          </h3>
          <p className="text-sm text-white/90 mb-3">
            {connectAccount
              ? t('payout.complete_description')
              : t('payout.connect_bank')}
          </p>
          
          <Button
            onClick={() => navigate('/payout-setup')}
            className="bg-white text-green-600 hover:bg-white/90 font-semibold"
            size="sm"
          >
            {connectAccount ? t('payout.continue_setup') : t('payout.start_setup')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
