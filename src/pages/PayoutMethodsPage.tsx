import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateEmail, validateIBAN, validateBankName, validateAccountHolderName, formatIBAN } from '@/lib/validation';

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
  const [withdrawalInfo, setWithdrawalInfo] = useState<{
    canWithdraw: boolean;
    daysRemaining?: number;
    nextEligibleDate?: string;
    message?: string;
  } | null>(null);
  const [errors, setErrors] = useState<{
    paypalEmail?: string;
    iban?: string;
    bankName?: string;
    accountHolderName?: string;
  }>({});

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

        // Calculate balance using the new function (only released payments with reviews)
        const { data: balanceData, error: balanceError } = await (supabase as any)
          .rpc('get_sitter_available_balance', {
            p_sitter_id: currentUser.id
          });
        
        if (!balanceError && balanceData !== null) {
          setBalance(Number(balanceData) || 0);
        } else {
          // Fallback: calculate manually
          const { data: bookings } = await supabase
            .from('bookings')
            .select('total_price, commission_fee, payment_status, review_submitted_at, balance_released_at')
            .eq('sitter_id', currentUser.id)
            .eq('status', 'completed')
            .eq('payment_status', 'released')
            .not('review_submitted_at', 'is', null)
            .not('balance_released_at', 'is', null);
          
          if (bookings) {
            const totalBalance = bookings.reduce((sum, b) => {
              const sitterAmount = (b.total_price || 0) - (b.commission_fee || 0);
              return sum + sitterAmount;
            }, 0);
            setBalance(totalBalance);
          }
        }

        // Check withdrawal eligibility
        const { data: withdrawalData, error: withdrawalError } = await (supabase as any)
          .rpc('can_sitter_withdraw', {
            p_sitter_id: currentUser.id
          });
        
        if (!withdrawalError && withdrawalData) {
          setWithdrawalInfo({
            canWithdraw: withdrawalData.can_withdraw,
            daysRemaining: withdrawalData.days_remaining,
            nextEligibleDate: withdrawalData.next_eligible_date,
            message: withdrawalData.message,
          });
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

  // Validate form based on selected method
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (payoutMethod === 'paypal') {
      const emailValidation = validateEmail(formData.paypalEmail);
      if (!emailValidation.isValid) {
        newErrors.paypalEmail = emailValidation.error;
      }
    } else {
      const ibanValidation = validateIBAN(formData.iban);
      if (!ibanValidation.isValid) {
        newErrors.iban = ibanValidation.error;
      }

      const bankNameValidation = validateBankName(formData.bankName);
      if (!bankNameValidation.isValid) {
        newErrors.bankName = bankNameValidation.error;
      }

      const accountHolderValidation = validateAccountHolderName(formData.accountHolderName);
      if (!accountHolderValidation.isValid) {
        newErrors.accountHolderName = accountHolderValidation.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!currentUser) return;

    // Validate form
    if (!validateForm()) {
      toast({
        title: t('common.error'),
        description: t('payout.pleaseFixErrors'),
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
        updateData.paypal_email = formData.paypalEmail.trim().toLowerCase();
        updateData.bank_name = null;
        updateData.iban = null;
        updateData.account_holder_name = null;
      } else {
        updateData.paypal_email = null;
        updateData.bank_name = formData.bankName.trim();
        // Store IBAN without spaces for consistency
        updateData.iban = formData.iban.replace(/\s/g, '').toUpperCase();
        updateData.account_holder_name = formData.accountHolderName.trim();
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', currentUser.id);

      if (error) throw error;

      // Clear errors on success
      setErrors({});

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

    // Check withdrawal eligibility (2-week restriction)
    if (withdrawalInfo && !withdrawalInfo.canWithdraw) {
      toast({
        title: t('common.error'),
        description: withdrawalInfo.message || `You can withdraw in ${withdrawalInfo.daysRemaining} days`,
        variant: 'destructive',
      });
      return;
    }

    // Validate that payout method is properly set up
    if (payoutMethod === 'paypal') {
      const emailValidation = validateEmail(formData.paypalEmail);
      if (!emailValidation.isValid) {
        toast({
          title: t('common.error'),
          description: t('payout.addMethodFirst'),
          variant: 'destructive',
        });
        return;
      }
    } else {
      const ibanValidation = validateIBAN(formData.iban);
      const bankNameValidation = validateBankName(formData.bankName);
      const accountHolderValidation = validateAccountHolderName(formData.accountHolderName);
      
      if (!ibanValidation.isValid || !bankNameValidation.isValid || !accountHolderValidation.isValid) {
        toast({
          title: t('common.error'),
          description: t('payout.addMethodFirst'),
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      // Create payout request
      const { error: payoutError } = await supabase
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

      if (payoutError) throw payoutError;

      // Update withdrawal date (2-week restriction)
      const { error: updateError } = await (supabase as any)
        .rpc('update_withdrawal_date', {
          p_sitter_id: currentUser!.id
        });

      if (updateError) {
        console.warn('Failed to update withdrawal date:', updateError);
      }

      toast({
        title: t('common.success'),
        description: t('payout.requestSubmitted'),
      });

      // Reload pending payouts and withdrawal info
      const { data: payouts } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('sitter_id', currentUser!.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      setPendingPayouts(payouts || []);

      // Refresh withdrawal info
      const { data: withdrawalData } = await (supabase as any)
        .rpc('can_sitter_withdraw', {
          p_sitter_id: currentUser!.id
        });
      
      if (withdrawalData) {
        setWithdrawalInfo({
          canWithdraw: withdrawalData.can_withdraw,
          daysRemaining: withdrawalData.days_remaining,
          nextEligibleDate: withdrawalData.next_eligible_date,
          message: withdrawalData.message,
        });
      }
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
        <div className="rounded-xl bg-gradient-to-br from-medium-jungle to-sage-green p-6 shadow-lg text-white">
          <p className="text-sm opacity-90 mb-1">{t('payout.availableBalance')}</p>
          <p className="text-4xl font-bold mb-2">€{balance.toFixed(2)}</p>
          
          {/* Withdrawal Restriction Info */}
          {withdrawalInfo && !withdrawalInfo.canWithdraw && (
            <div className="mb-4 p-3 bg-white/20 rounded-lg text-sm">
              <p className="font-medium mb-1">⏳ Withdrawal Restriction</p>
              <p className="text-xs opacity-90">
                {withdrawalInfo.message || `You can withdraw in ${withdrawalInfo.daysRemaining} days`}
              </p>
              {withdrawalInfo.nextEligibleDate && (
                <p className="text-xs opacity-75 mt-1">
                  Next eligible: {new Date(withdrawalInfo.nextEligibleDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          <Button
            onClick={handleRequestPayout}
            disabled={
              balance <= 0 || 
              pendingPayouts.length > 0 || 
              (withdrawalInfo && !withdrawalInfo.canWithdraw)
            }
            className="w-full bg-white text-primary hover:bg-gray-100 disabled:opacity-50"
          >
            {pendingPayouts.length > 0 
              ? t('payout.requestPending') 
              : withdrawalInfo && !withdrawalInfo.canWithdraw
              ? `Withdraw in ${withdrawalInfo.daysRemaining} days`
              : t('payout.requestPayout')
            }
          </Button>
          
          <p className="text-xs opacity-75 mt-2 text-center">
            💡 Balance includes only payments released after reviews
          </p>
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
                  {t('payout.paypalEmail')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.paypalEmail}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, paypalEmail: value });
                    // Real-time validation
                    if (value && errors.paypalEmail) {
                      const validation = validateEmail(value);
                      if (validation.isValid) {
                        setErrors({ ...errors, paypalEmail: undefined });
                      } else {
                        setErrors({ ...errors, paypalEmail: validation.error });
                      }
                    }
                  }}
                  onBlur={() => {
                    const validation = validateEmail(formData.paypalEmail);
                    if (!validation.isValid) {
                      setErrors({ ...errors, paypalEmail: validation.error });
                    }
                  }}
                  placeholder="your@email.com"
                  className={`w-full ${errors.paypalEmail ? 'border-red-500' : ''}`}
                />
                {errors.paypalEmail && (
                  <p className="text-xs text-red-500 mt-1">{errors.paypalEmail}</p>
                )}
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
                  {t('payout.accountHolderName')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.accountHolderName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, accountHolderName: value });
                    // Real-time validation
                    if (value && errors.accountHolderName) {
                      const validation = validateAccountHolderName(value);
                      if (validation.isValid) {
                        setErrors({ ...errors, accountHolderName: undefined });
                      } else {
                        setErrors({ ...errors, accountHolderName: validation.error });
                      }
                    }
                  }}
                  onBlur={() => {
                    const validation = validateAccountHolderName(formData.accountHolderName);
                    if (!validation.isValid) {
                      setErrors({ ...errors, accountHolderName: validation.error });
                    }
                  }}
                  placeholder={t('payout.fullName')}
                  className={`w-full ${errors.accountHolderName ? 'border-red-500' : ''}`}
                />
                {errors.accountHolderName && (
                  <p className="text-xs text-red-500 mt-1">{errors.accountHolderName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  {t('payout.iban')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    const formatted = formatIBAN(value);
                    setFormData({ ...formData, iban: formatted });
                    // Real-time validation
                    if (formatted && errors.iban) {
                      const validation = validateIBAN(formatted);
                      if (validation.isValid) {
                        setErrors({ ...errors, iban: undefined });
                      } else {
                        setErrors({ ...errors, iban: validation.error });
                      }
                    }
                  }}
                  onBlur={() => {
                    const validation = validateIBAN(formData.iban);
                    if (!validation.isValid) {
                      setErrors({ ...errors, iban: validation.error });
                    }
                  }}
                  placeholder="ES91 2100 0418 4502 0005 1332"
                  className={`w-full font-mono ${errors.iban ? 'border-red-500' : ''}`}
                />
                {errors.iban && (
                  <p className="text-xs text-red-500 mt-1">{errors.iban}</p>
                )}
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                  Format: 2-letter country code + check digits + account number
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  {t('payout.bankName')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, bankName: value });
                    // Real-time validation
                    if (value && errors.bankName) {
                      const validation = validateBankName(value);
                      if (validation.isValid) {
                        setErrors({ ...errors, bankName: undefined });
                      } else {
                        setErrors({ ...errors, bankName: validation.error });
                      }
                    }
                  }}
                  onBlur={() => {
                    const validation = validateBankName(formData.bankName);
                    if (!validation.isValid) {
                      setErrors({ ...errors, bankName: validation.error });
                    }
                  }}
                  placeholder={t('payout.bankNamePlaceholder')}
                  className={`w-full ${errors.bankName ? 'border-red-500' : ''}`}
                />
                {errors.bankName && (
                  <p className="text-xs text-red-500 mt-1">{errors.bankName}</p>
                )}
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
        <div className="rounded-xl bg-sage-green/10 dark:bg-sage-green/20 border border-ash-grey dark:border-sage-green/30 p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-medium-jungle dark:text-sage-green">
              shield
            </span>
            <div className="text-sm text-medium-jungle dark:text-sage-green">
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
