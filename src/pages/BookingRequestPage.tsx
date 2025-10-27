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

  // Calculate pricing
  const subtotal = hourlyRate * formData.duration;
  const platformFee = subtotal * 0.20; // 20% platform fee
  const total = subtotal + platformFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { supabase } = await import('@/integrations/supabase/client');

      // Create walk request
      const { data: walkRequest, error } = await supabase
        .from('walk_requests')
        .insert({
          owner_id: currentUser?.id,
          walker_id: walkerId,
          dog_id: formData.dogId || 'temp-dog-id', // Required field
          walk_date: formData.date,
          walk_time: formData.startTime,
          duration: formData.duration,
          price: total,
          service_type: 'walk',
          location: 'TBD',
          status: 'pending',
          notes: formData.notes || '',
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for walker
      await supabase.from('notifications').insert({
        user_id: walkerId,
        type: 'walk_request',
        title: 'New walk request',
        message: `You have a new walk request for ${formData.date}`,
        related_id: walkRequest.id,
        is_read: false,
      });

      toast({
        title: 'Booking Request Sent!',
        description: 'The walker will be notified of your request.',
      });

      navigate('/dashboard');
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
              placeholder="Any special instructions for the walker..."
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
            disabled={loading}
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
