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
    email: userProfile?.email || '',
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
      let imageUrl = formData.profileImage;
      if (imagePreview && imagePreview !== formData.profileImage) {
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
    <div className="min-h-screen bg-stitch-bg-light p-4 overflow-y-auto pb-24">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0 rounded-3xl">
          <CardHeader className="border-b border-stitch-border-light">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-stitch-text-primary-light font-display">
                {t('dashboard.editProfile')}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
                <span className="material-symbols-outlined">close</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-36 h-36 ring-4 ring-stitch-primary shadow-lg rounded-3xl">
                    <AvatarImage src={imagePreview || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-stitch-primary to-stitch-secondary text-white text-4xl rounded-3xl">
                      {formData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 bg-stitch-primary hover:bg-stitch-primary/90 text-white p-3 rounded-2xl cursor-pointer shadow-lg transition-colors"
                  >
                    <span className="material-symbols-outlined">photo_camera</span>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <p className="text-sm text-stitch-text-secondary-light text-center">
                  Click the camera icon to change your photo
                </p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-stitch-text-primary-light font-medium">
                  <span className="material-symbols-outlined text-base">person</span>
                  {t('auth.name')}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="text-lg rounded-2xl border-stitch-border-light focus:border-stitch-primary"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-stitch-text-primary-light font-medium">
                  <span className="material-symbols-outlined text-base">mail</span>
                  {t('auth.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled
                  className="text-lg bg-stitch-bg-light rounded-2xl"
                />
                <p className="text-xs text-stitch-text-secondary-light">
                  Email cannot be changed
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-stitch-text-primary-light font-medium">
                  <span className="material-symbols-outlined text-base">phone</span>
                  {t('auth.phone')}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="text-lg rounded-2xl border-stitch-border-light focus:border-stitch-primary"
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2 text-stitch-text-primary-light font-medium">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  {t('auth.city')}
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="text-lg rounded-2xl border-stitch-border-light focus:border-stitch-primary"
                />
              </div>

              {/* Postal Code */}
              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-stitch-text-primary-light font-medium">
                  {t('auth.postalCode')}
                </Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  required
                  className="text-lg rounded-2xl border-stitch-border-light focus:border-stitch-primary"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-stitch-text-primary-light font-medium">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  placeholder="Tell others about yourself..."
                  className="text-lg resize-none rounded-2xl border-stitch-border-light focus:border-stitch-primary"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-2xl"
                  disabled={loading}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-stitch-primary to-stitch-secondary hover:from-stitch-primary/90 hover:to-stitch-secondary/90 text-white rounded-2xl shadow-md"
                  disabled={loading}
                >
                  <span className="material-symbols-outlined mr-2">save</span>
                  {loading ? 'Saving...' : t('common.save')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;

