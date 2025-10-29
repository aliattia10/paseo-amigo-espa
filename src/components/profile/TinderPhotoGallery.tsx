import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TinderPhotoGalleryProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

const TinderPhotoGallery: React.FC<TinderPhotoGalleryProps> = ({ 
  photos, 
  onPhotosChange,
  maxPhotos = 6 
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleUpload = async (file: File, index: number) => {
    if (!currentUser) return;

    setUploadingIndex(index);
    try {
      // Validate
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB');
      }

      // Upload
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/photo-${index}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update photos array
      const newPhotos = [...photos];
      newPhotos[index] = publicUrl;
      onPhotosChange(newPhotos);

      toast({
        title: 'Success!',
        description: `Photo ${index + 1} uploaded`,
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleDelete = async (index: number) => {
    if (!photos[index]) return;

    try {
      const oldPath = photos[index].split('/').slice(-2).join('/');
      await supabase.storage.from('avatars').remove([oldPath]);

      const newPhotos = [...photos];
      newPhotos[index] = '';
      onPhotosChange(newPhotos);

      toast({
        title: 'Photo deleted',
        description: `Photo ${index + 1} removed`,
      });
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      {Array.from({ length: maxPhotos }).map((_, index) => (
        <div key={index} className="relative aspect-square">
          {photos[index] ? (
            // Existing photo
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800">
              <img
                src={photos[index]}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-white text-lg">close</span>
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                  Main
                </div>
              )}
            </div>
          ) : (
            // Empty slot - upload button
            <label
              htmlFor={`photo-upload-${index}`}
              className={`w-full h-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors ${
                uploadingIndex === index ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <input
                id={`photo-upload-${index}`}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, index);
                  e.target.value = '';
                }}
                className="hidden"
                disabled={uploadingIndex !== null}
              />
              {uploadingIndex === index ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-3xl text-gray-400 dark:text-gray-600 mb-1">
                    add_photo_alternate
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    Add Photo
                  </span>
                </>
              )}
            </label>
          )}
        </div>
      ))}
    </div>
  );
};

export default TinderPhotoGallery;
