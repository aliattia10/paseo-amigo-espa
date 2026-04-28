import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { formatPetAge, parseLegacyAge } from '@/lib/pet-age';
import { formatCurrencyChf } from '@/lib/currency';
import { emitBookingWorkflowEvent } from '@/lib/booking-workflow';

const resolvePrimaryPetImage = (raw?: string | null): string | undefined => {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const first = parsed.find((v) => typeof v === 'string' && v.length > 0);
      return typeof first === 'string' ? first : undefined;
    }
    if (typeof parsed === 'string' && parsed.length > 0) return parsed;
  } catch {
    // legacy single-url value
  }
  return raw;
};

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
    referralCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [dogs, setDogs] = useState<Array<{
    id: string;
    name: string;
    age?: string | null;
    age_years?: number | null;
    age_months?: number | null;
    allergies?: string | null;
    health_issues?: string | null;
    special_needs?: string | null;
    image_url?: string;
    image_preview?: string;
    pet_type?: 'dog' | 'cat';
  }>>([]);

  // Fetch user's dogs
  React.useEffect(() => {
    if (!currentUser) return;
    const controller = new AbortController();
    const fetchDogs = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const res = await Promise.race([
          supabase.from('pets').select('id, name, age, age_years, age_months, allergies, health_issues, special_needs, image_url, pet_type').eq('owner_id', currentUser.id),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
        ]);
        if (!res || !res.data) return;
        const { data, error } = res as any;
        if (error) return; // silent empty state on any error
        setDogs(
          (data || []).map((dog: any) => ({
            ...dog,
            pet_type: (dog.pet_type as 'cat' | 'dog') || 'dog',
            image_preview: resolvePrimaryPetImage(dog.image_url),
          }))
        );
        if (data && data.length === 1) setFormData(prev => ({ ...prev, dogId: data[0].id }));
      } catch { /* silent */ }
    };
    fetchDogs();
    return () => controller.abort();
  }, [currentUser]);

  // Calculate pricing
  const subtotal = hourlyRate * formData.duration; // Base price (sitter's hourly rate × hours)
  const platformFee = subtotal * 0.20; // 20% platform fee
  const hasReferralCode = formData.referralCode.trim().length > 0;
  const discountEligibleHours = Math.min(formData.duration, 10); // up to 10 hours
  const referralDiscount = hasReferralCode ? hourlyRate * discountEligibleHours * 0.05 : 0;
  const total = subtotal + platformFee - referralDiscount; // Total price (what owner pays)
  const selectedPet = dogs.find((d) => d.id === formData.dogId);

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

      // Persist referral details in notes for downstream billing/support.
      const referralCode = formData.referralCode.trim().toUpperCase();
      const bookingNotes = [
        formData.notes?.trim() || '',
        referralCode ? `Referral code: ${referralCode}` : '',
        referralCode ? `Referral discount: ${formatCurrencyChf(referralDiscount)} (5% for up to 10h)` : '',
      ].filter(Boolean).join('\n');

      // Create booking using RPC function or direct insert
      let bookingError = null;
      let createdBookingId: string | null = null;
      
      // Try RPC function first
      const { data: bookingId, error: rpcError } = await supabase.rpc('create_booking', {
        p_owner_id: currentUser?.id,
        p_sitter_id: walkerId,
        p_dog_id: formData.dogId,
        p_start_time: startDateTime.toISOString(),
        p_end_time: endDateTime.toISOString(),
        p_service_type: 'walk',
        p_location: 'TBD',
        p_notes: bookingNotes,
        p_total_price: total,
      });

      // If RPC doesn't exist, try direct insert
      if (rpcError && (rpcError.message.includes('does not exist') || rpcError.message.includes('not find'))) {
        const { data: inserted, error: insertError } = await supabase
          .from('bookings')
          .insert({
            owner_id: currentUser?.id,
            sitter_id: walkerId,
            dog_id: formData.dogId,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            service_type: 'walk',
            location: 'TBD',
            notes: bookingNotes,
            total_price: total,
            commission_fee: platformFee,
            status: 'requested',
            payment_status: 'pending',
          })
          .select('id')
          .single();
        createdBookingId = inserted?.id ?? null;
        bookingError = insertError;
      } else {
        createdBookingId = bookingId ?? null;
        bookingError = rpcError;
      }

      if (bookingError) throw bookingError;

      toast({
        title: 'Booking Request Sent!',
        description: 'The sitter will be notified of your request.',
      });

      if (createdBookingId && currentUser?.id && walkerId) {
        await emitBookingWorkflowEvent({
          bookingId: createdBookingId,
          ownerId: currentUser.id,
          sitterId: walkerId,
          actorId: currentUser.id,
          ownerNotification: {
            type: 'booking_requested',
            title: 'Booking Request Created',
            message: 'Your booking request is now pending sitter acceptance.',
          },
          sitterNotification: {
            type: 'booking_requested',
            title: 'New Booking Request',
            message: 'You received a new booking request. Accept to continue to payment.',
          },
          chatMessage: 'Booking request sent. Current status: Pending acceptance.',
        });
      }

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
                  onClick={() => navigate('/pet-profile-setup')}
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
                        backgroundImage: dog.image_preview
                          ? `url("${dog.image_preview}")`
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                    />
                    <span className="font-medium">
                      {dog.pet_type === 'cat' ? '🐱' : '🐶'} {dog.name}
                    </span>
                    <span className="text-xs opacity-80 ml-auto">
                      {formatPetAge(
                        dog.age_years ?? parseLegacyAge(dog.age).ageYears,
                        dog.age_months ?? parseLegacyAge(dog.age).ageMonths,
                        dog.age
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Pet Health & Care */}
          {selectedPet && (selectedPet.allergies || selectedPet.health_issues || selectedPet.special_needs) && (
            <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
              <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                {t('pet.healthAndCare', 'Health & Care')}
              </h3>
              <div className="space-y-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {selectedPet.allergies && (
                  <p>
                    <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">{t('pet.allergies', 'Allergies')}:</span> {selectedPet.allergies}
                  </p>
                )}
                {selectedPet.health_issues && (
                  <p>
                    <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">{t('pet.healthIssues', 'Health Issues')}:</span> {selectedPet.health_issues}
                  </p>
                )}
                {selectedPet.special_needs && (
                  <p>
                    <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">{t('pet.specialNeeds', 'Special Needs')}:</span> {selectedPet.special_needs}
                  </p>
                )}
              </div>
            </div>
          )}

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

          {/* Referral Code */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Referral Code (optional)
            </label>
            <Input
              value={formData.referralCode}
              onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
              placeholder="Enter referral code"
              className="w-full"
            />
            <p className="text-xs mt-2 text-text-secondary-light dark:text-text-secondary-dark">
              Add any valid referral code to get 5% off (up to 10 sitting hours).
            </p>
          </div>

          {/* Price Breakdown */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
              Price Breakdown
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-text-primary-light dark:text-text-primary-dark">
                <span>Hourly Rate</span>
                <span>{formatCurrencyChf(hourlyRate)}/hr</span>
              </div>
              <div className="flex justify-between text-text-primary-light dark:text-text-primary-dark">
                <span>Duration</span>
                <span>{formData.duration} hour{formData.duration > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-text-primary-light dark:text-text-primary-dark">
                <span>Subtotal</span>
                <span>{formatCurrencyChf(subtotal)}</span>
              </div>
              <div className="flex justify-between text-text-secondary-light dark:text-text-secondary-dark text-sm">
                <span>Platform Fee (20%)</span>
                <span>{formatCurrencyChf(platformFee)}</span>
              </div>
              {hasReferralCode && (
                <div className="flex justify-between text-green-600 dark:text-green-400 text-sm">
                  <span>Referral Discount (5%, max 10h)</span>
                  <span>-{formatCurrencyChf(referralDiscount)}</span>
                </div>
              )}
              <div className="border-t border-border-light dark:border-border-dark pt-2 mt-2"></div>
              <div className="flex justify-between text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                <span>Total</span>
                <span>{formatCurrencyChf(total)}</span>
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
            {t('booking.chargeNotice')}
          </p>
        </form>
      </main>
    </div>
  );
};

export default BookingRequestPage;
