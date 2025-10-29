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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [petData, setPetData] = useState({
    name: '',
    petType: 'dog' as 'dog' | 'cat',
    age: '',
    breed: '',
    notes: '',
    imageUrls: [] as string[], // Changed to array for multiple images
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
          
          // Parse image URLs for dogs table too
          let imageUrls: string[] = [];
          if (dogData.image_url) {
            try {
              imageUrls = JSON.parse(dogData.image_url);
            } catch {
              imageUrls = [dogData.image_url];
            }
          }
          
          setPetData({
            name: dogData.name || '',
            petType: 'dog',
            age: dogData.age || '',
            breed: dogData.breed || '',
            notes: dogData.notes || '',
            imageUrls: imageUrls,
          });
        } else {
          throw error;
        }
      } else {
        // Parse image URLs - support both single image and array
        let imageUrls: string[] = [];
        if (data.image_url) {
          try {
            // Try to parse as JSON array first
            imageUrls = JSON.parse(data.image_url);
          } catch {
            // If not JSON, treat as single URL
            imageUrls = [data.image_url];
          }
        }
        
        setPetData({
          name: data.name || '',
          petType: (data.pet_type as 'cat' | 'dog') || 'dog',
          age: data.age || '',
          breed: data.breed || '',
          notes: data.notes || '',
          imageUrls: imageUrls,
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
      console.log('=== IMAGE UPLOAD START ===');
      console.log('File:', file.name, file.type, file.size);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${petData.petType}-${Date.now()}.${fileExt}`;
      const filePath = `pets/${fileName}`;

      console.log('Uploading to:', filePath);
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);
      
      // Add new image to the array
      const newImageUrls = [...petData.imageUrls, publicUrl];
      
      // Save to database immediately
      console.log('Saving to database...');
      const imageUrlJson = JSON.stringify(newImageUrls);
      const { error: updateError } = await supabase
        .from('pets')
        .update({
          image_url: imageUrlJson,
          updated_at: new Date().toISOString(),
        })
        .eq('id', petId);

      if (updateError) {
        console.error('Database update error:', updateError);
        // Try dogs table as fallback
        if (updateError.message.includes('does not exist')) {
          const { error: dogError } = await supabase
            .from('dogs')
            .update({
              image_url: imageUrlJson,
              updated_at: new Date().toISOString(),
            })
            .eq('id', petId);
          
          if (dogError) {
            console.error('Dogs table update error:', dogError);
            throw new Error('Failed to save image to database');
          }
        } else {
          throw updateError;
        }
      }
      
      console.log('Database updated successfully');
      setPetData({ ...petData, imageUrls: newImageUrls });
      setCurrentImageIndex(newImageUrls.length - 1); // Show the newly uploaded image
      
      toast({
        title: t('common.success'),
        description: `${petData.petType === 'cat' ? 'Cat' : 'Pet'} picture uploaded and saved successfully`,
      });
      
      console.log('=== IMAGE UPLOAD END ===');
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== FILE CHANGE EVENT ===');
    const file = e.target.files?.[0];
    console.log('File selected:', file);
    
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      toast({
        title: t('common.error'),
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large:', file.size);
      toast({
        title: t('common.error'),
        description: 'Image size must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('File validation passed, starting upload...');
    handleImageUpload(file);
    
    // Reset input so same file can be selected again
    e.target.value = '';
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
      console.log('=== SAVE PET START ===');
      console.log('Pet data:', petData);
      
      // Convert image URLs array to JSON string
      const imageUrlJson = JSON.stringify(petData.imageUrls);
      
      const { error } = await supabase
        .from('pets')
        .update({
          name: petData.name,
          pet_type: petData.petType,
          age: petData.age,
          breed: petData.breed || null,
          notes: petData.notes,
          image_url: imageUrlJson,
          updated_at: new Date().toISOString(),
        })
        .eq('id', petId);

      if (error) {
        console.error('Update error:', error);
        // Try dogs table if pets doesn't exist
        if (error.message.includes('does not exist')) {
          const { error: dogError } = await supabase
            .from('dogs')
            .update({
              name: petData.name,
              age: petData.age,
              breed: petData.breed || null,
              notes: petData.notes,
              image_url: imageUrlJson,
              updated_at: new Date().toISOString(),
            })
            .eq('id', petId);
          
          if (dogError) throw dogError;
        } else {
          throw error;
        }
      }

      console.log('Pet updated successfully');
      toast({
        title: t('common.success'),
        description: `${petData.petType === 'cat' ? 'Cat' : 'Pet'} profile updated successfully!`,
      });

      navigate('/profile');
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to update pet profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('=== SAVE PET END ===');
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
          Edit Pet Profile
        </h2>
        <div className="flex w-12 items-center justify-end"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pet Type Selector */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
              Pet Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPetData({ ...petData, petType: 'dog' })}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  petData.petType === 'dog'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark border-2 border-border-light dark:border-border-dark'
                }`}
              >
                <span className="text-2xl">🐕</span>
                <span>Dog</span>
              </button>
              <button
                type="button"
                onClick={() => setPetData({ ...petData, petType: 'cat' })}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  petData.petType === 'cat'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark border-2 border-border-light dark:border-border-dark'
                }`}
              >
                <span className="text-2xl">🐈</span>
                <span>Cat</span>
              </button>
            </div>
          </div>

          {/* Pet Pictures - Tinder Style Gallery */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
              Pet Photos
            </label>
            
            {/* Image Gallery */}
            {petData.imageUrls.length > 0 ? (
              <div className="relative mb-4">
                {/* Main Image Display */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
                  <img
                    src={petData.imageUrls[currentImageIndex]}
                    alt={`${petData.name} photo ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Image Counter */}
                  <div className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                    {currentImageIndex + 1} / {petData.imageUrls.length}
                  </div>
                  
                  {/* Navigation Arrows */}
                  {petData.imageUrls.length > 1 && (
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
                        onClick={() => setCurrentImageIndex(Math.min(petData.imageUrls.length - 1, currentImageIndex + 1))}
                        disabled={currentImageIndex === petData.imageUrls.length - 1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </>
                  )}
                  
                  {/* Delete Current Image Button */}
                  {petData.imageUrls.length > 0 && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm('Delete this photo?')) return;
                        
                        try {
                          const newUrls = petData.imageUrls.filter((_, i) => i !== currentImageIndex);
                          
                          // Save to database immediately
                          const imageUrlJson = JSON.stringify(newUrls);
                          const { error: updateError } = await supabase
                            .from('pets')
                            .update({
                              image_url: imageUrlJson,
                              updated_at: new Date().toISOString(),
                            })
                            .eq('id', petId);

                          if (updateError) {
                            // Try dogs table as fallback
                            if (updateError.message.includes('does not exist')) {
                              const { error: dogError } = await supabase
                                .from('dogs')
                                .update({
                                  image_url: imageUrlJson,
                                  updated_at: new Date().toISOString(),
                                })
                                .eq('id', petId);
                              
                              if (dogError) throw dogError;
                            } else {
                              throw updateError;
                            }
                          }
                          
                          setPetData({ ...petData, imageUrls: newUrls });
                          setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
                          toast({
                            title: 'Photo deleted',
                            description: 'Photo has been removed successfully',
                          });
                        } catch (error: any) {
                          toast({
                            title: 'Error',
                            description: 'Failed to delete photo',
                            variant: 'destructive',
                          });
                        }
                      }}
                      className="absolute bottom-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors backdrop-blur-sm"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  )}
                </div>
                
                {/* Dot Indicators */}
                {petData.imageUrls.length > 1 && (
                  <div className="flex justify-center gap-2 mt-3">
                    {petData.imageUrls.map((_, index) => (
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
            
            {/* Upload Button */}
            <input
              id="pet-picture"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploadingImage || petData.imageUrls.length >= 6}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => document.getElementById('pet-picture')?.click()}
              className="w-full text-primary border-2 border-primary hover:bg-primary hover:text-white transition-colors" 
              disabled={uploadingImage || petData.imageUrls.length >= 6}
            >
              <span className="material-symbols-outlined mr-2">add_photo_alternate</span>
              {uploadingImage ? 'Uploading...' : petData.imageUrls.length >= 6 ? 'Maximum 6 photos' : `Add Photo (${petData.imageUrls.length}/6)`}
            </Button>
            
            {uploadingImage && (
              <div className="flex items-center justify-center gap-2 mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Uploading...</span>
              </div>
            )}
          </div>

          {/* Pet Name */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Pet's Name <span className="text-red-500">*</span>
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
