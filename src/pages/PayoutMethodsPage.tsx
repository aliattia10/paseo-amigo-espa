import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PayoutMethodsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'paypal' | 'bank'>('paypal');
  const [formData, setFormData] = useState({
    paypalEmail: '',
    bankName: '',
    iban: '',
    accountHolderName: '',
  });
  const [balance, setBalance] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);

  // Load existing payout info and balance
  useEffect(() => {
    const loadPayoutInfo = async () => {
      if (!currentUser) return;
      
      try {
        // Load payout methods
        const { data: userData } = await supabase
          .from('users')
          .select('payout_method, paypal_email, bank_name, iban, account_holder_name')
          .eq('id', currentUser.id)
          .single();
        
        if (userData) {
          setPayoutMethod(userData.payout_method || 'paypal');
          setFormData({
            paypalEmail: userData.paypal_email || '',
            bankName: userData.bank_name || '',
            iban: userData.iban || '',
            accountHolderName: userData.account_holder_name || '',
          });
        }

        // Calculate balance from completed bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select('total_amount, commission_fee, payment_status')
          .eq('sitter_id', currentUser.id)
          .eq('status', 'completed')
          .eq('payment_status', 'held');
        
        if (bookings) {
          const totalBalance = bookings.reduce((sum, b) => {
            const sitterAmount = b.total_amount - (b.commission_fee || 0);
            return sum + sitterAmount;
          }, 0);
          setBalance(totalBalance);
        }

        // Load pending payout requests
        const { data: payouts } = await supabase
          .from('payout_requests')
          .select('*')
          .eq('sitter_id', currentUser.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        
        setPendingPayouts(payouts || []);
      } catch (error) {
        console.error('Error loading payout info:', error);
      }
    };
    
    loadPayoutInfo();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;

    // Validate based on selected method
    if (payoutMethod === 'paypal' && !formData.paypalEmail) {
      toast({
        title: t('common.error'),
        description: t('payout.paypalEmailRequired'),
        variant: 'destructive',
      });
      return;
    }

    if (payoutMethod === 'bank' && (!formData.iban || !formData.accountHolderName)) {
      toast({
        title: t('common.error'),
        description: t('payout.bankDetailsRequired'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        payout_method: payoutMethod,
        updated_at: new Date().toISOString(),
      };

      if (payoutMethod === 'paypal') {
        updateData.paypal_email = formData.paypalEmail.trim();
        updateData.bank_name = null;
        updateData.iban = null;
        updateData.account_holder_name = null;
      } else {
        updateData.paypal_email = null;
        updateData.bank_name = formData.bankName.trim();
        updateData.iban = formData.iban.trim();
        updateData.account_holder_name = formData.accountHolderName.trim();
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', currentUser.id);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('payout.methodSaved'),
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: t('common.error'),
        description: error.message || t('payout.saveFailed'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (balance <= 0) {
      toast({
        title: t('common.error'),
        description: t('payout.noBalance'),
        variant: 'destructive',
      });
      return;
    }

    if (!formData.paypalEmail && !formData.iban) {
      toast({
        title: t('common.error'),
        description: t('payout.addMethodFirst'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('payout_requests')
        .insert({
          sitter_id: currentUser!.id,
          amount: balance,
          payout_method: payoutMethod,
          payout_details: payoutMethod === 'paypal' 
            ? formData.paypalEmail 
            : `${formData.bankName} - ${formData.iban}`,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('payout.requestSubmitted'),
      });

      // Reload pending payouts
      const { data: payouts } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('sitter_id', currentUser!.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      setPendingPayouts(payouts || []);
    } catch (error: any) {
      console.error('Payout request error:', error);
      toast({
        title: t('common.error'),
        description: error.message || t('payout.requestFailed'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 p-4 pb-2 justify-between backdrop-blur-sm">
        <button onClick={() => navigate('/profile')}>
          <span className="material-symbols-outlined text-text-primary-light dark:text-text-primary-dark text-2xl">
            arrow_back
          </span>
        </button>
        <h2 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
          {t('payout.paymentMethods')}
        </h2>
        <div className="w-12"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 p-4 space-y-4">
        {/* Balance Card */}
        <div className="rounded-xl bg-gradient-to-br from-primary to-secondary p-6 shadow-lg text-white">
          <p className="text-sm opacity-90 mb-1">{t('payout.availableBalance')}</p>
          <p className="text-4xl font-bold mb-4">${balance.toFixed(2)}</p>
          <Button
            onClick={handleRequestPayout}
            disabled={balance <= 0 || pendingPayouts.length > 0}
            className="w-full bg-white text-primary hover:bg-gray-100"
          >
            {pendingPayouts.length > 0 ? t('payout.requestPending') : t('payout.requestPayout')}
          </Button>
        </div>

        {/* Pending Payouts */}
        {pendingPayouts.length > 0 && (
          <div className="rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              {t('payout.pendingRequest')}
            </p>
            {pendingPayouts.map(payout => (
              <div key={payout.id} className="text-sm text-yellow-700 dark:text-yellow-300">
                ${payout.amount.toFixed(2)} - {new Date(payout.created_at).toLocaleDateString()}
              </div>
            ))}
          </div>
        )}

        {/* Payout Method Selection */}
        <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
          <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
            {t('payout.selectMethod')}
          </h3>
          
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setPayoutMethod('paypal')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                payoutMethod === 'paypal'
                  ? 'border-primary bg-primary/10'
                  : 'border-border-light dark:border-border-dark'
              }`}
            >
              <div className="text-2xl mb-2">💳</div>
              <div className="font-bold text-sm">PayPal</div>
            </button>
            
            <button
              onClick={() => setPayoutMethod('bank')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                payoutMethod === 'bank'
                  ? 'border-primary bg-primary/10'
                  : 'border-border-light dark:border-border-dark'
              }`}
            >
              <div className="text-2xl mb-2">🏦</div>
              <div className="font-bold text-sm">{t('payout.bankTransfer')}</div>
            </button>
          </div>

          {/* PayPal Form */}
          {payoutMethod === 'paypal' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  {t('payout.paypalEmail')}
                </label>
                <Input
                  type="email"
                  value={formData.paypalEmail}
                  onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full"
                />
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                  {t('payout.paypalNote')}
                </p>
              </div>
            </div>
          )}

          {/* Bank Transfer Form */}
          {payoutMethod === 'bank' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  {t('payout.accountHolderName')}
                </label>
                <Input
                  type="text"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                  placeholder={t('payout.fullName')}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  {t('payout.iban')}
                </label>
                <Input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
                  placeholder="ES91 2100 0418 4502 0005 1332"
                  className="w-full font-mono"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  {t('payout.bankName')}
                </label>
                <Input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder={t('payout.bankNamePlaceholder')}
                  className="w-full"
                />
              </div>

              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                {t('payout.bankNote')}
              </p>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full mt-4 bg-primary text-white"
          >
            {loading ? t('common.saving') : t('common.saveChanges')}
          </Button>
        </div>

        {/* How it Works */}
        <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
          <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-3">
            {t('payout.howItWorks')}
          </h3>
          <div className="space-y-3 text-sm text-text-secondary-light dark:text-text-secondary-dark">
            <div className="flex gap-3">
              <span className="text-primary font-bold">1.</span>
              <p>{t('payout.step1')}</p>
            </div>
            <div className="flex gap-3">
              <span className="text-primary font-bold">2.</span>
              <p>{t('payout.step2')}</p>
            </div>
            <div className="flex gap-3">
              <span className="text-primary font-bold">3.</span>
              <p>{t('payout.step3')}</p>
            </div>
            <div className="flex gap-3">
              <span className="text-primary font-bold">4.</span>
              <p>{t('payout.step4')}</p>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400">
              shield
            </span>
            <div className="text-sm text-green-800 dark:text-green-200">
              <p className="font-medium mb-1">{t('payout.secureStorage')}</p>
              <p className="text-xs opacity-90">{t('payout.securityNote')}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PayoutMethodsPage;
