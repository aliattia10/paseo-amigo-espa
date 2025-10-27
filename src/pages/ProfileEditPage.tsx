import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ProfileEditPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
    city: userProfile?.city || '',
    postalCode: userProfile?.postalCode || '',
    bio: '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
          postal_code: formData.postalCode,
        })
        .eq('id', currentUser?.id);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: 'Profile updated successfully',
      });

      navigate('/profile');
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark max-w-md mx-auto">
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
          {t('dashboard.editProfile')}
        </h2>
        <div className="flex w-12 items-center justify-end"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">
        {/* Profile Picture */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 border-4 border-card-light dark:border-card-dark shadow-md"
            style={{
              backgroundImage: 'url("https://api.dicebear.com/7.x/avataaars/svg?seed=' + (currentUser?.email || 'default') + '")'
            }}
          />
          <Button variant="outline" className="text-primary">
            <span className="material-symbols-outlined mr-2">photo_camera</span>
            Change Photo
          </Button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              {t('auth.name')}
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full"
              placeholder="Your name"
            />
          </div>

          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              {t('auth.phone')}
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full"
              placeholder="Your phone number"
            />
          </div>

          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              {t('auth.city')}
            </label>
            <Input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full"
              placeholder="Your city"
            />
          </div>

          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              {t('auth.postalCode')}
            </label>
            <Input
              type="text"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className="w-full"
              placeholder="Your postal code"
            />
          </div>

          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full min-h-[100px] p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 pb-8">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white h-12"
          >
            {loading ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ProfileEditPage;
