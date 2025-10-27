import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Camera, Save, X, Mail, Phone, MapPin, User as UserIcon } from 'lucide-react';
import { updateUserProfile, uploadProfileImage } from '@/lib/nearby-services';
import { createActivity } from '@/lib/activity-services';
import type { User } from '@/types';

interface ProfileSettingsProps {
  onClose: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(userProfile?.profileImage || null);
  
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: '',
    phone: userProfile?.phone || '',
    city: userProfile?.city || '',
    postalCode: userProfile?.postalCode || '',
    bio: userProfile?.bio || '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('common.error'),
          description: 'Image size must be less than 5MB',
          variant: "destructive",
        });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Upload profile image if changed
      let imageUrl = imagePreview;
      if (imagePreview && imagePreview !== userProfile?.profileImage) {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file = fileInput?.files?.[0];
        if (file) {
          imageUrl = await uploadProfileImage(userProfile.id, file);
        }
      }

      // Update user profile in Supabase
      await updateUserProfile(userProfile.id, {
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        postal_code: formData.postalCode,
        bio: formData.bio,
        profile_image: imageUrl,
      });

      // Create activity for profile update
      await createActivity(
        userProfile.id,
        'profile_updated',
        {
          changes: ['profile information'],
        },
        true
      );
      
      toast({
        title: t('common.success'),
        description: 'Profile updated successfully!',
      });
      
      // Reload to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to update profile',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-text-primary-light dark:text-text-primary-dark">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 p-4 pb-2 justify-between backdrop-blur-sm">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <button onClick={onClose}>
            <span className="material-symbols-outlined text-text-primary-light dark:text-text-primary-dark text-2xl">arrow_back</span>
          </button>
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Profile</h2>
        <div className="flex w-12 items-center justify-end">
          <button onClick={onClose}>
            <span className="material-symbols-outlined text-text-primary-light dark:text-text-primary-dark text-2xl">close</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-24">
        {/* Profile Header */}
        <div className="flex p-4 @container">
          <div className="flex w-full flex-col gap-4 items-center">
            <form onSubmit={handleSubmit} className="w-full max-w-[480px] space-y-4">
              {/* Profile Image */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div 
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32 border-4 border-card-light dark:border-card-dark shadow-md"
                    style={{ backgroundImage: imagePreview ? `url("${imagePreview}")` : 'none', backgroundColor: imagePreview ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  />
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-[22px] font-bold leading-tight tracking-[-0.015em]">{formData.name || 'Your Name'}</p>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal leading-normal">{formData.city || 'Your City'}</p>
                </div>
              </div>

              {/* Information Cards/Sections */}
              <div className="flex flex-col gap-4 w-full">
                {/* Account Management List */}
                <div className="rounded-xl bg-card-light dark:bg-card-dark shadow-sm overflow-hidden">
                  <ul className="divide-y divide-border-light dark:divide-border-dark">
                    <li className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">person</span>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder={t('auth.name')}
                          className="border-0 focus-visible:ring-0 font-medium"
                        />
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">mail</span>
                        <Input
                          type="email"
                          value={formData.email}
                          disabled
                          className="border-0 focus-visible:ring-0 bg-transparent"
                        />
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">phone</span>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          placeholder={t('auth.phone')}
                          className="border-0 focus-visible:ring-0 font-medium"
                        />
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">location_on</span>
                        <Input
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          required
                          placeholder={t('auth.city')}
                          className="border-0 focus-visible:ring-0 font-medium"
                        />
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">location_city</span>
                        <Input
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          required
                          placeholder={t('auth.postalCode')}
                          className="border-0 focus-visible:ring-0 font-medium"
                        />
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Bio Section */}
                <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
                  <h3 className="text-lg font-bold mb-3">Bio</h3>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell others about yourself..."
                    className="border-border-light dark:border-border-dark rounded-lg resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex w-full max-w-[480px] gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/20 dark:bg-primary/30 text-primary text-sm font-bold leading-normal tracking-[0.015em] flex-1"
                  >
                    <span className="truncate">{t('common.cancel')}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] flex-1"
                  >
                    <span className="truncate">{loading ? 'Saving...' : t('common.save')}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettings;

