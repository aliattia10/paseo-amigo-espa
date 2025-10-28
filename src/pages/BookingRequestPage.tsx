import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const BookingRequestPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const walkerId = searchParams.get('walkerId');
  const walkerName = searchParams.get('walkerName') || 'Walker';
  const hourlyRate = parseFloat(searchParams.get('rate') || '15');

  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    duration: 1,
    notes: '',
    dogId: '',
  });

  const [loading, setLoading] = useState(false);
  const [dogs, setDogs] = useState<Array<{ id: string; name: string; image_url?: string; pet_type?: 'dog' | 'cat' }>>([]);

  // Fetch user's dogs
  React.useEffect(() => {
    const fetchDogs = async () => {
      if (!currentUser) return;
      
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('pets')
          .select('id, name, image_url, pet_type')
          .eq('owner_id', currentUser?.id);
        
        if (error) {
          // If table doesn't exist, show empty state
          if (error.message.includes('does not exist') || error.message.includes('not find')) {
            console.warn('Pets table not found. Please run database migrations.');
            setDogs([]);
            return;
          }
          throw error;
        }
        setDogs(data || []);
        
        // Auto-select first dog if only one
        if (data && data.length === 1) {
          setFormData(prev => ({ ...prev, dogId: data[0].id }));
        }
      } catch (error: any) {
        console.error('Error fetching dogs:', error);
        toast({
          title: t('common.error'),
          description: 'Failed to load your pets',
          variant: 'destructive',
        });
      }
    };
    
    if (currentUser) {
      fetchDogs();
    }
  }, [currentUser]);

  // Calculate pricing
  const subtotal = hourlyRate * formData.duration;
  const platformFee = subtotal * 0.20; // 20% platform fee
  const total = subtotal + platformFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dogId) {
      toast({
        title: t('common.error'),
        description: 'Please select a dog',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);

    try {
      const { supabase } = await import('@/integrations/supabase/client');

      // Create start and end datetime
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60 * 60 * 1000);

      // Create booking using RPC function or direct insert
      let bookingError = null;
      
      // Try RPC function first
      const { data: bookingId, error: rpcError } = await supabase.rpc('create_booking', {
        p_owner_id: currentUser?.id,
        p_sitter_id: walkerId,
        p_dog_id: formData.dogId,
        p_start_time: startDateTime.toISOString(),
        p_end_time: endDateTime.toISOString(),
        p_service_type: 'walk',
        p_location: 'TBD',
        p_notes: formData.notes || '',
        p_total_price: total,
      });

      // If RPC doesn't exist, try direct insert
      if (rpcError && (rpcError.message.includes('does not exist') || rpcError.message.includes('not find'))) {
        const { error: insertError } = await supabase
          .from('bookings')
          .insert({
            owner_id: currentUser?.id,
            sitter_id: walkerId,
            dog_id: formData.dogId,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            service_type: 'walk',
            location: 'TBD',
            notes: formData.notes || '',
            total_price: total,
            commission_fee: platformFee,
            status: 'requested',
          });
        bookingError = insertError;
      } else {
        bookingError = rpcError;
      }

      if (bookingError) throw bookingError;

      toast({
        title: 'Booking Request Sent!',
        description: 'The sitter will be notified of your request.',
      });

      navigate('/bookings');
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
          <button onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined text-text-primary-light dark:text-text-primary-dark text-2xl">
              arrow_back
            </span>
          </button>
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center text-text-primary-light dark:text-text-primary-dark">
          Book {walkerName}
        </h2>
        <div className="flex w-12 items-center justify-end"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pet Selection */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Select Pet <span className="text-red-500">*</span>
            </label>
            {dogs.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-3">
                  You need to add a pet profile first
                </p>
                <Button
                  type="button"
                  onClick={() => navigate('/dog-profile-setup')}
                  variant="outline"
                >
                  Add Pet Profile
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {dogs.map((dog) => (
                  <button
                    key={dog.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, dogId: dog.id })}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      formData.dogId === dog.id
                        ? 'bg-primary text-white'
                        : 'bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark border border-border-light dark:border-border-dark'
                    }`}
                  >
                    <div 
                      className="w-12 h-12 rounded-full bg-cover bg-center"
                      style={{
                        backgroundImage: dog.image_url 
                          ? `url("${dog.image_url}")`
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                    />
                    <span className="font-medium">
                      {dog.pet_type === 'cat' ? '🐱' : '🐶'} {dog.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Date *
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full"
            />
          </div>

          {/* Time Selection */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Start Time *
            </label>
            <Input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
              className="w-full"
            />
          </div>

          {/* Duration Selection */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Duration (hours) *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setFormData({ ...formData, duration: hours })}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                    formData.duration === hours
                      ? 'bg-primary text-white'
                      : 'bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark'
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Special Instructions
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full min-h-[100px] p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark"
              placeholder="Any special instructions for the sitter..."
            />
          </div>

          {/* Price Breakdown */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
              Price Breakdown
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-text-primary-light dark:text-text-primary-dark">
                <span>Hourly Rate</span>
                <span>${hourlyRate.toFixed(2)}/hr</span>
              </div>
              <div className="flex justify-between text-text-primary-light dark:text-text-primary-dark">
                <span>Duration</span>
                <span>{formData.duration} hour{formData.duration > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-text-primary-light dark:text-text-primary-dark">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-secondary-light dark:text-text-secondary-dark text-sm">
                <span>Platform Fee (20%)</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-border-light dark:border-border-dark pt-2 mt-2"></div>
              <div className="flex justify-between text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || dogs.length === 0 || !formData.dogId}
            className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base font-bold"
          >
            {loading ? t('common.loading') : 'Send Booking Request'}
          </Button>

          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark text-center">
            You won't be charged until the walker accepts your request
          </p>
        </form>
      </main>
    </div>
  );
};

export default BookingRequestPage;
