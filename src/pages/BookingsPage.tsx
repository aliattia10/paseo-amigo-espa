import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/ui/BottomNavigation';
import ReviewModal from '@/components/bookings/ReviewModal';
import i18n from '@/lib/i18n';

interface Booking {
  id: string;
  walker_name: string;
  owner_name: string;
  dog_name: string;
  booking_date: string;
  start_time: string;
  duration_hours: number;
  total_amount: number;
  status: 'pending' | 'accepted' | 'confirmed' | 'completed' | 'cancelled' | 'requested' | 'in-progress';
  notes?: string;
  payment_status?: string;
  owner_id?: string;
  sitter_id?: string;
  completed_at?: string;
  completion_confirmed_at?: string;
  eligible_for_release_at?: string;
  payment_released_at?: string;
}

const BookingsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [currentUser]);

  const fetchBookings = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          sitter:users!bookings_sitter_id_fkey(name),
          owner:users!bookings_owner_id_fkey(name),
          dog:dogs(name)
        `)
        .or(`owner_id.eq.${currentUser?.id},sitter_id.eq.${currentUser?.id}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        // If table doesn't exist, show empty state instead of error
        if (error.message.includes('does not exist') || error.message.includes('not find')) {
          console.warn('Bookings table not found. Please run database migrations.');
          setBookings([]);
          setLoading(false);
          return;
        }
        throw error;
      }
      
      const formattedBookings = data?.map((booking: any) => ({
        id: booking.id,
        walker_name: booking.sitter?.name || 'Unknown',
        owner_name: booking.owner?.name || 'Unknown',
        dog_name: booking.dog?.name || 'Dog',
        booking_date: new Date(booking.start_time).toISOString().split('T')[0],
        start_time: new Date(booking.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        duration_hours: Math.round((new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / (1000 * 60 * 60)),
        total_amount: booking.total_price || 0,
        status: booking.status,
        notes: booking.notes,
        payment_status: booking.payment_status,
        owner_id: booking.owner_id,
        sitter_id: booking.sitter_id,
        completed_at: booking.completed_at,
        completion_confirmed_at: booking.completion_confirmed_at,
        eligible_for_release_at: booking.eligible_for_release_at,
        payment_released_at: booking.payment_released_at
      })) || [];
      
      setBookings(formattedBookings);
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Sitter accepts booking - this will notify owner to pay
      const { error } = await supabase.rpc('update_booking_status', {
        p_booking_id: bookingId,
        p_new_status: 'confirmed'
      });
      
      if (error) throw error;
      
      toast({ 
        title: t('bookings.bookingAccepted'), 
        description: t('bookings.ownerNotified') 
      });
      
      fetchBookings();
    } catch (error: any) {
      console.error('Error accepting booking:', error);
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    }
  };

  const handleReleasePayment = async (bookingId: string) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase.functions.invoke('capture-payment', {
        body: { bookingId },
      });
      if (error) throw error;
      toast({ title: t('bookings.paymentReleased'), description: t('bookings.paymentReleasedDesc') });
      fetchBookings();
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    }
  };

  const handleRefund = async (bookingId: string) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase.functions.invoke('refund-payment', {
        body: { bookingId, reason },
      });
      if (error) throw error;
      toast({ title: 'Booking Cancelled', description: 'Booking cancelled and payment refunded.' });
      fetchBookings();
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Get booking details
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*, owner_id, sitter_id')
        .eq('id', bookingId)
        .single();
      
      if (!bookingData) {
        throw new Error('Booking not found');
      }
      
      const reason = prompt('Please provide a reason for cancellation:');
      if (!reason) return;
      
      const { error } = await (supabase as any).rpc('update_booking_status', {
        p_booking_id: bookingId,
        p_new_status: 'cancelled',
        p_cancellation_reason: reason
      });
      
      if (error) throw error;
      
      toast({ 
        title: 'Booking Cancelled', 
        description: 'The booking has been cancelled successfully.' 
      });
      
      fetchBookings();
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    }
  };

  const handleMarkComplete = async (bookingId: string) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await (supabase as any).rpc('mark_service_completed', {
        p_booking_id: bookingId
      });
      
      if (error) throw error;
      
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to mark service as completed');
      }
      
      toast({ 
        title: '✅ Service Marked Complete', 
        description: 'Waiting for owner confirmation to release payment.' 
      });
      
      fetchBookings();
    } catch (error: any) {
      console.error('Error marking complete:', error);
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    }
  };

  const handleConfirmCompletion = async (bookingId: string, booking: Booking) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await (supabase as any).rpc('confirm_service_completion', {
        p_booking_id: bookingId
      });
      
      if (error) throw error;
      
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to confirm completion');
      }
      
      toast({ 
        title: '✅ Completion Confirmed!', 
        description: 'Payment will be released in 3 days. Please leave a review!' 
      });
      
      // Open review modal
      setSelectedBooking(booking);
      setReviewModalOpen(true);
      
      fetchBookings();
    } catch (error: any) {
      console.error('Error confirming completion:', error);
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    }
  };

  const handleForceReleasePayment = async (bookingId: string) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await (supabase as any).rpc('release_payment_to_sitter', {
        p_booking_id: bookingId,
        p_force_release: true
      });
      
      if (error) throw error;
      
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to release payment');
      }
      
      toast({ 
        title: t('bookings.paymentReleased'), 
        description: t('bookings.paymentTransferred') 
      });
      
      fetchBookings();
    } catch (error: any) {
      console.error('Error releasing payment:', error);
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    }
  };

  const getReleaseCountdown = (eligibleDate: string) => {
    const now = new Date();
    const release = new Date(eligibleDate);
    const diffMs = release.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Ready to release';
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'pending') return (booking.status as string) === 'requested';
    if (filter === 'accepted') return (booking.status as string) === 'confirmed';
    return booking.status === filter;
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return 'bg-yellow-500/10 text-yellow-600';
      case 'confirmed': return 'bg-blue-500/10 text-blue-600';
      case 'in-progress': return 'bg-purple-500/10 text-purple-600';
      case 'completed': return 'bg-green-500/10 text-green-600';
      case 'cancelled': return 'bg-red-500/10 text-red-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  return (
    <div className="relative mx-auto flex h-screen max-w-md flex-col bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between bg-card-light/95 dark:bg-card-dark/95 px-4 py-3 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
        <button onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined text-text-primary-light dark:text-text-primary-dark text-2xl">
            arrow_back
          </span>
        </button>
        <h1 className="text-text-primary-light dark:text-text-primary-dark text-xl font-bold">
          {t('bookings.myBookings')}
        </h1>
        <button
          onClick={() => {
            const languages = ['en', 'es', 'fr'];
            const currentIndex = languages.indexOf(i18n.language);
            const nextIndex = (currentIndex + 1) % languages.length;
            i18n.changeLanguage(languages[nextIndex]);
          }}
          className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs font-medium text-gray-700 dark:text-gray-300"
        >
          {i18n.language === 'en' ? 'EN' : i18n.language === 'es' ? 'ES' : 'FR'}
        </button>
      </header>
      
      {/* Filter Tabs */}
      <div className="sticky top-[60px] z-10 flex px-4 py-3 gap-2 overflow-x-auto bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
        {['all', 'pending', 'accepted', 'completed'].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setFilter(tab as any)} 
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm transition-colors flex-shrink-0 ${
              filter === tab 
                ? 'bg-primary text-white shadow-sm' 
                : 'bg-card-light dark:bg-card-dark text-text-primary-light dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t(`bookings.filter.${tab}`)}
          </button>
        ))}
      </div>
      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="space-y-3 px-4 py-3 pb-24">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-symbols-outlined text-6xl mb-4 text-text-secondary-light dark:text-text-secondary-dark">
                event_busy
              </span>
              <p className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                No bookings found
              </p>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark px-4">
                Start browsing sitters to make your first booking!
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
            <div key={booking.id} className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">{booking.walker_name}</p>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{booking.dog_name}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${getStatusColor(booking.status)}`}>
                  {booking.status === 'confirmed' ? t('bookings.confirmed') : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-text-secondary-light dark:text-text-secondary-dark mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">calendar_today</span>
                  <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">schedule</span>
                  <span>{booking.start_time} • {booking.duration_hours}h</span>
                </div>
              </div>
            
              {/* Show Accept/Decline buttons when booking is requested (for SITTER) */}
              {(booking.status as string) === 'requested' && currentUser?.id === booking.sitter_id && (
                <div className="flex gap-2">
                  <Button onClick={() => handleAcceptBooking(booking.id)} className="flex-1 bg-primary text-white">
                    {t('bookings.accept')}
                  </Button>
                  <Button onClick={() => handleCancelBooking(booking.id)} variant="outline" className="flex-1">
                    {t('bookings.decline')}
                  </Button>
                </div>
              )}
              
              {/* Show Pay Now button when booking confirmed but not paid (OWNER) */}
              {(booking.status as string) === 'confirmed' && (!booking.payment_status || booking.payment_status === 'pending') && currentUser?.id === booking.owner_id && (
                <Button 
                  onClick={() => navigate(`/payment?bookingId=${booking.id}`)} 
                  className="w-full bg-primary text-white"
                >
                  💳 {t('bookings.payNow')} - €{booking.total_amount.toFixed(2)}
                </Button>
              )}
              
              {/* Show waiting message when confirmed and paid */}
              {(booking.status as string) === 'confirmed' && booking.payment_status === 'held' && (
                <div>
                  <div className="text-sm text-center text-green-600 dark:text-green-400 mb-2">
                    ✓ Payment secured - Waiting for service
                  </div>
                  {/* SITTER: Show "Mark as Complete" button */}
                  {currentUser?.id === booking.sitter_id && (
                    <Button 
                      onClick={() => handleMarkComplete(booking.id)} 
                      className="w-full bg-green-600 text-white hover:bg-green-700"
                    >
                      ✅ Mark Service Complete
                    </Button>
                  )}
                </div>
              )}
              
              {/* Service completed by sitter, waiting for owner confirmation */}
              {(booking.status as string) === 'completed' && booking.completed_at && !booking.completion_confirmed_at && (
                <div>
                  {currentUser?.id === booking.owner_id ? (
                    <>
                      <div className="text-sm text-center text-blue-600 dark:text-blue-400 mb-2">
                        🎉 Service completed! Please confirm and review
                      </div>
                      <Button 
                        onClick={() => handleConfirmCompletion(booking.id, booking)} 
                        className="w-full bg-blue-600 text-white hover:bg-blue-700"
                      >
                        ✓ Confirm & Review
                      </Button>
                    </>
                  ) : (
                    <div className="text-sm text-center text-blue-600 dark:text-blue-400">
                      ⏳ Waiting for owner confirmation
                    </div>
                  )}
                </div>
              )}
              
              {/* Completion confirmed, payment in 3-day hold */}
              {(booking.status as string) === 'completed' && booking.completion_confirmed_at && booking.payment_status === 'held' && !booking.payment_released_at && (
                <div>
                  <div className="text-sm text-center mb-2">
                    <div className="text-green-600 dark:text-green-400 font-medium">
                      ✅ Service Confirmed
                    </div>
                    {booking.eligible_for_release_at && (
                      <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                        Payment release: {getReleaseCountdown(booking.eligible_for_release_at)}
                      </div>
                    )}
                  </div>
                  {/* OWNER: Can force early release */}
                  {currentUser?.id === booking.owner_id && booking.eligible_for_release_at && (
                    <Button 
                      onClick={() => handleForceReleasePayment(booking.id)} 
                      variant="outline"
                      className="w-full"
                    >
                      💰 Release Payment Now
                    </Button>
                  )}
                  {/* SITTER: Just shows waiting */}
                  {currentUser?.id === booking.sitter_id && (
                    <div className="text-xs text-center text-gray-500">
                      Payment will be automatically released after 3 days
                    </div>
                  )}
                </div>
              )}
              
              {/* Payment released */}
              {booking.payment_status === 'released' && booking.payment_released_at && (
                <div className="text-sm text-center text-green-600 dark:text-green-400 font-medium">
                  💵 Payment Released - Transferred to sitter
                </div>
              )}
              
              {/* Show Cancel & Refund button when requested and payment held */}
              {(booking.status as string) === 'requested' && booking.payment_status === 'held' && (
                <Button onClick={() => handleRefund(booking.id)} variant="destructive" className="w-full">
                  {t('bookings.cancelRefund')}
                </Button>
              )}
            </div>
          ))
        )}
        </div>
      </main>
      <BottomNavigation />
      
      {/* Review Modal */}
      {selectedBooking && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedBooking(null);
          }}
          bookingId={selectedBooking.id}
          revieweeId={selectedBooking.sitter_id || ''}
          revieweeName={selectedBooking.walker_name}
          onReviewSubmitted={() => {
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};

export default BookingsPage;
