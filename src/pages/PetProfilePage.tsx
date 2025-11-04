import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface Pet {
  id: string;
  name: string;
  pet_type: 'dog' | 'cat';
  age: string;
  breed: string;
  notes: string;
  image_url: string;
  owner_id: string;
}

const PetProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchPetData();
  }, [petId]);

  const fetchPetData = async () => {
    if (!petId || !currentUser) {
      navigate('/profile');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();

      if (error) {
        // Try dogs table if pets doesn't exist
        if (error.message.includes('does not exist')) {
          const { data: dogData, error: dogError } = await supabase
            .from('dogs')
            .select('*')
            .eq('id', petId)
            .single();
          
          if (dogError) throw dogError;
          
          setPet({
            ...dogData,
            pet_type: 'dog',
          });
          
          // Parse images
          if (dogData.image_url) {
            try {
              const parsed = JSON.parse(dogData.image_url);
              setImageUrls(Array.isArray(parsed) ? parsed : [dogData.image_url]);
            } catch {
              setImageUrls([dogData.image_url]);
            }
          }
        } else {
          throw error;
        }
      } else {
        setPet({
          ...data,
          pet_type: (data.pet_type as 'cat' | 'dog') || 'dog',
        });
        
        // Parse images
        if (data.image_url) {
          try {
            const parsed = JSON.parse(data.image_url);
            setImageUrls(Array.isArray(parsed) ? parsed : [data.image_url]);
          } catch {
            setImageUrls([data.image_url]);
          }
        }
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: 'Failed to load pet profile',
        variant: 'destructive',
      });
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pet) {
    return null;
  }

  const mainPhoto = imageUrls[currentImageIndex] || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + pet.name;

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
          {pet.name}'s Profile
        </h2>
        <div className="flex w-12 items-center justify-end">
          {currentUser?.id === pet.owner_id && (
            <button 
              onClick={() => navigate(`/pet/${pet.id}/edit`)}
              className="text-primary hover:text-primary/80"
            >
              <span className="material-symbols-outlined">edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4 pb-8">
        {/* Pet Photo Gallery */}
        <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
          {imageUrls.length > 0 ? (
            <div className="relative mb-4">
              {/* Main Image Display */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
                <img
                  src={mainPhoto}
                  alt={`${pet.name} photo ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Counter */}
                {imageUrls.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                    {currentImageIndex + 1} / {imageUrls.length}
                  </div>
                )}
                
                {/* Navigation Arrows */}
                {imageUrls.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                      disabled={currentImageIndex === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentImageIndex(Math.min(imageUrls.length - 1, currentImageIndex + 1))}
                      disabled={currentImageIndex === imageUrls.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </>
                )}
              </div>
              
              {/* Dot Indicators */}
              {imageUrls.length > 1 && (
                <div className="flex justify-center gap-2 mt-3">
                  {imageUrls.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'w-8 bg-primary'
                          : 'w-2 bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-white text-6xl">pets</span>
            </div>
          )}
        </div>

        {/* Pet Info Card */}
        <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm space-y-4">
          {/* Name and Type */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-1">
              {pet.pet_type === 'cat' ? '🐱' : '🐶'} {pet.name}
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              {pet.pet_type === 'cat' ? t('profile.cat') : t('profile.dog')}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-light dark:border-border-dark">
            <div className="text-center">
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-1">
                {t('profile.age')}
              </p>
              <p className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                {pet.age}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-1">
                {t('profile.breed')}
              </p>
              <p className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                {pet.breed || t('profile.mixed')}
              </p>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {pet.notes && (
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">info</span>
              {t('profile.aboutPet')}
            </h3>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
              {pet.notes}
            </p>
          </div>
        )}

        {/* Edit Button (if owner) */}
        {currentUser?.id === pet.owner_id && (
          <Button
            onClick={() => navigate(`/pet/${pet.id}/edit`)}
            className="w-full bg-primary text-white h-12 text-base font-bold"
          >
            <span className="material-symbols-outlined mr-2">edit</span>
            {t('profile.editPetProfile')}
          </Button>
        )}
      </main>
    </div>
  );
};

export default PetProfilePage;
