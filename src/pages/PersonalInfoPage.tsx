import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PersonalInfoPage: React.FC = () => {
  const { t } = useTranslation(); // i18n
  const navigate = useNavigate();
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  
  // User info form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Password change data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [sendingResetEmail, setSendingResetEmail] = useState(false);

  // Load user data from Supabase - fetch fresh data on mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;
      
      try {
        // Fetch latest user data from database
        const { data, error } = await supabase
          .from('users')
          .select('name, phone, email')
          .eq('id', currentUser.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setFormData({
            name: data.name || '',
            email: currentUser.email || data.email || '',
            phone: data.phone || '',
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to context data
        if (userProfile) {
          setFormData({
            name: userProfile.name || '',
            email: currentUser.email || '',
            phone: userProfile.phone || '',
          });
        }
      }
    };
    
    loadUserData();
  }, [currentUser, userProfile]);

  // Track if form has changes
  useEffect(() => {
    if (currentUser && userProfile) {
      const changed = 
        formData.name !== (userProfile.name || '') ||
        formData.email !== (currentUser.email || '') ||
        formData.phone !== (userProfile.phone || '');
      setHasChanges(changed);
    }
  }, [formData, currentUser, userProfile]);

  // Handle email update
  const handleEmailUpdate = async () => {
    if (!formData.email || formData.email === currentUser?.email) {
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: t('common.error'), // i18n
        description: t('personalInfo.invalidEmail'), // i18n
        variant: 'destructive',
      });
      return;
    }

    setUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: formData.email,
      });

      if (error) throw error;

      toast({
        title: t('common.success'), // i18n
        description: t('personalInfo.emailUpdateSent'), // i18n
      });
    } catch (error: any) {
      console.error('Email update error:', error);
      toast({
        title: t('common.error'), // i18n
        description: error.message || t('personalInfo.emailUpdateFailed'), // i18n
        variant: 'destructive',
      });
    } finally {
      setUpdatingEmail(false);
    }
  };

  // Handle password reset email
  const handleSendPasswordResetEmail = async () => {
    if (!currentUser?.email) {
      toast({
        title: t('common.error'), // i18n
        description: t('personalInfo.noEmailFound'), // i18n
        variant: 'destructive',
      });
      return;
    }

    setSendingResetEmail(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(currentUser.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: t('common.success'), // i18n
        description: t('personalInfo.passwordResetEmailSent'), // i18n
      });

      setShowPasswordSection(false);
    } catch (error: any) {
      console.error('Password reset email error:', error);
      toast({
        title: t('common.error'), // i18n
        description: error.message || t('personalInfo.passwordUpdateFailed'), // i18n
        variant: 'destructive',
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Handle save changes (name, phone, email)
  const handleSaveChanges = async () => {
    if (!currentUser) return;

    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: t('common.error'), // i18n
        description: t('personalInfo.nameRequired'), // i18n
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Update user profile in database
      const { data: updateData, error: profileError } = await supabase
        .from('users')
        .update({
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id)
        .select();

      if (profileError) throw profileError;

      // Update email if changed
      if (formData.email !== currentUser.email) {
        await handleEmailUpdate();
      }

      // Refresh user profile to get latest data from database
      await refreshUserProfile();
      
      // Re-fetch and update local state with fresh data
      const { data: freshData } = await supabase
        .from('users')
        .select('name, phone, email')
        .eq('id', currentUser.id)
        .single();
      
      if (freshData) {
        setFormData({
          name: freshData.name || '',
          email: currentUser.email || freshData.email || '',
          phone: freshData.phone || '',
        });
      }

      toast({
        title: t('common.success'), // i18n
        description: t('personalInfo.updateSuccessful'), // i18n
      });

      setHasChanges(false);
    } catch (error: any) {
      console.error('Save changes error:', error);
      toast({
        title: t('common.error'), // i18n
        description: error.message || t('personalInfo.updateFailed'), // i18n
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    // Reset form to original values
    if (currentUser && userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: currentUser.email || '',
        phone: userProfile.phone || '',
      });
      setHasChanges(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark max-w-md mx-auto">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 p-4 pb-2 justify-between backdrop-blur-sm">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <button onClick={() => navigate('/profile')}>
            <span className="material-symbols-outlined text-text-primary-light dark:text-text-primary-dark text-2xl">
              arrow_back
            </span>
          </button>
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center text-text-primary-light dark:text-text-primary-dark">
          {t('profile.personalInfo')} {/* i18n */}
        </h2>
        <div className="flex w-12"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="flex flex-col gap-4 p-4">
          {/* Account Information Section */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
              {t('personalInfo.accountInformation')} {/* i18n */}
            </h3>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  {t('personalInfo.name')} {/* i18n */}
                </label>
                {/* i18n */}
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark"
                  placeholder={t('personalInfo.namePlaceholder')}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  {t('personalInfo.email')} {/* i18n */}
                </label>
                {/* i18n */}
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark"
                  placeholder={t('personalInfo.emailPlaceholder')}
                />
                {formData.email !== currentUser?.email && (
                  <p className="text-xs text-secondary mt-1">
                    {t('personalInfo.emailChangeNote')} {/* i18n */}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  {t('personalInfo.phone')} {/* i18n */}
                </label>
                {/* i18n */}
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark"
                  placeholder={t('personalInfo.phonePlaceholder')}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {hasChanges && (
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  {t('common.cancel')} {/* i18n */}
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  className="flex-1 bg-primary text-white"
                  disabled={loading}
                >
                  {loading ? t('common.saving') : t('common.saveChanges')} {/* i18n */}
                </Button>
              </div>
            )}
          </div>

          {/* Password Section */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                {t('personalInfo.password')} {/* i18n */}
              </h3>
              {!showPasswordSection && (
                <button
                  onClick={() => setShowPasswordSection(true)}
                  className="text-primary font-medium text-sm"
                >
                  {t('personalInfo.changePassword')} {/* i18n */}
                </button>
              )}
            </div>

            {showPasswordSection ? (
              <div className="space-y-4">
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {t('personalInfo.passwordResetDescription')} {/* i18n */}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={() => setShowPasswordSection(false)}
                    variant="outline"
                    className="flex-1"
                    disabled={sendingResetEmail}
                  >
                    {t('common.cancel')} {/* i18n */}
                  </Button>
                  <Button
                    onClick={handleSendPasswordResetEmail}
                    className="flex-1 bg-primary text-white"
                    disabled={sendingResetEmail}
                  >
                    {sendingResetEmail ? t('common.sending') : t('personalInfo.sendResetEmail')} {/* i18n */}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {t('personalInfo.passwordHidden')} {/* i18n */}
              </p>
            )}
          </div>

          {/* Account Details (Read-only) */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
              {t('personalInfo.accountDetails')} {/* i18n */}
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border-light dark:border-border-dark">
                <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {t('personalInfo.accountType')} {/* i18n */}
                </span>
                <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark capitalize">
                  {userProfile?.userType || 'User'}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {t('personalInfo.memberSince')} {/* i18n */}
                </span>
                <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  {userProfile?.createdAt 
                    ? new Date(userProfile.createdAt).toLocaleDateString()
                    : t('personalInfo.unknown') /* i18n */
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PersonalInfoPage;
