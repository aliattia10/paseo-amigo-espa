import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PetEditPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { petId } = useParams<{ petId: string }>();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [petData, setPetData] = useState({
    name: '',
    petType: 'dog' as 'dog' | 'cat',
    age: '',
    breed: '',
    notes: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchPetData();
  }, [petId]);

  const fetchPetData = async () => {
    if (!petId || !currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .eq('owner_id', currentUser.id)
        .single();

      if (error) {
        // Try dogs table if pets doesn't exist
        if (error.message.includes('does not exist')) {
          const { data: dogData, error: dogError } = await supabase
            .from('dogs')
            .select('*')
            .eq('id', petId)
            .eq('owner_id', currentUser.id)
            .single();
          
          if (dogError) throw dogError;
          
          setPetData({
            name: dogData.name || '',
            petType: 'dog',
            age: dogData.age || '',
            breed: dogData.breed || '',
            notes: dogData.notes || '',
            imageUrl: dogData.image_url || '',
          });
        } else {
          throw error;
        }
      } else {
        setPetData({
          name: data.name || '',
          petType: (data.pet_type as 'cat' | 'dog') || 'dog',
          age: data.age || '',
          breed: data.breed || '',
          notes: data.notes || '',
          imageUrl: data.image_url || '',
        });
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: 'Failed to load pet data',
        variant: 'destructive',
      });
      navigate('/profile');
    } finally {
      setLoadingData(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!currentUser) return;
    
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${petData.petType}-${Date.now()}.${fileExt}`;
      const filePath = `pets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setPetData({ ...petData, imageUrl: publicUrl });
      
      toast({
        title: t('common.success'),
        description: `${petData.petType === 'cat' ? 'Cat' : 'Dog'} picture uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('common.error'),
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('common.error'),
          description: 'Image size must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      handleImageUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!petData.name.trim()) {
      toast({
        title: t('common.error'),
        description: `Please enter your ${petData.petType}'s name`,
        variant: 'destructive',
      });
      return;
    }
    
    if (!petData.age.trim()) {
      toast({
        title: t('common.error'),
        description: `Please enter your ${petData.petType}'s age`,
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('pets')
        .update({
          name: petData.name,
          pet_type: petData.petType,
          age: petData.age,
          breed: petData.breed || null,
          notes: petData.notes,
          image_url: petData.imageUrl,
        })
        .eq('id', petId);

      if (error) {
        // Try dogs table if pets doesn't exist
        if (error.message.includes('does not exist')) {
          const { error: dogError } = await supabase
            .from('dogs')
            .update({
              name: petData.name,
              age: petData.age,
              breed: petData.breed || null,
              notes: petData.notes,
              image_url: petData.imageUrl,
            })
            .eq('id', petId);
          
          if (dogError) throw dogError;
        } else {
          throw error;
        }
      }

      toast({
        title: t('common.success'),
        description: `${petData.petType === 'cat' ? 'Cat' : 'Dog'} profile updated successfully!`,
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

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${petData.name}'s profile?`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId);

      if (error) {
        // Try dogs table if pets doesn't exist
        if (error.message.includes('does not exist')) {
          const { error: dogError } = await supabase
            .from('dogs')
            .delete()
            .eq('id', petId);
          
          if (dogError) throw dogError;
        } else {
          throw error;
        }
      }

      toast({
        title: t('common.success'),
        description: 'Pet profile deleted successfully',
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

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
          Edit {petData.petType === 'cat' ? 'Cat' : 'Dog'} Profile
        </h2>
        <div className="flex w-12 items-center justify-end"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pet Picture */}
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative">
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 border-4 border-card-light dark:border-card-dark shadow-lg"
                style={{
                  backgroundImage: petData.imageUrl 
                    ? `url("${petData.imageUrl}")`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              />
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            
            <label htmlFor="pet-picture" className="cursor-pointer">
              <input
                id="pet-picture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button 
                type="button" 
                variant="outline" 
                className="text-primary border-2 border-primary hover:bg-primary hover:text-white transition-colors" 
                disabled={uploadingImage}
              >
                <span className="material-symbols-outlined mr-2">photo_camera</span>
                {uploadingImage ? 'Uploading...' : 'Change Photo'}
              </Button>
            </label>
          </div>

          {/* Pet Name */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              {petData.petType === 'cat' ? 'Cat\'s' : 'Dog\'s'} Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={petData.name}
              onChange={(e) => setPetData({ ...petData, name: e.target.value })}
              className="w-full"
              placeholder={petData.petType === 'cat' ? 'e.g., Whiskers, Luna, Mittens' : 'e.g., Max, Bella, Charlie'}
              required
            />
          </div>

          {/* Pet Age */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Age <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={petData.age}
              onChange={(e) => setPetData({ ...petData, age: e.target.value })}
              className="w-full"
              placeholder="e.g., 2 years, 6 months"
              required
            />
          </div>

          {/* Pet Breed */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Breed (Optional)
            </label>
            <Input
              type="text"
              value={petData.breed}
              onChange={(e) => setPetData({ ...petData, breed: e.target.value })}
              className="w-full"
              placeholder={petData.petType === 'cat' ? 'e.g., Persian, Siamese, Mixed' : 'e.g., Golden Retriever, Mixed'}
            />
          </div>

          {/* Notes */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={petData.notes}
              onChange={(e) => setPetData({ ...petData, notes: e.target.value })}
              className="w-full min-h-[100px] p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark"
              placeholder="Any special care instructions, temperament, likes/dislikes..."
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              type="submit"
              disabled={loading || uploadingImage}
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base font-bold"
            >
              {loading ? t('common.loading') : 'Save Changes'}
            </Button>

            <Button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              variant="outline"
              className="w-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white h-12 text-base font-bold"
            >
              Delete Profile
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default PetEditPage;
