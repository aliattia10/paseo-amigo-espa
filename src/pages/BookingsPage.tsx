import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/ui/BottomNavigation';

interface Booking {
  id: string;
  walker_name: string;
  owner_name: string;
  dog_name: string;
  booking_date: string;
  start_time: string;
  duration_hours: number;
  total_amount: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  notes?: string;
}

const BookingsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');

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
        sitter_id: booking.sitter_id
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
        title: 'Booking Accepted!', 
        description: 'The owner has been notified to complete payment.' 
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
      toast({ title: 'Payment Released', description: 'Payment has been released to the sitter.' });
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
      
      const { error } = await supabase.rpc('update_booking_status', {
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
    <div className="relative mx-auto flex h-screen max-w-md flex-col bg-background-light dark:bg-background-dark overflow-y-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-card-light/80 dark:bg-card-dark/80 px-4 py-3 backdrop-blur-sm">
        <button onClick={() => navigate('/dashboard')}><span className="material-symbols-outlined text-text-primary-light dark:text-text-primary-dark text-2xl">arrow_back</span></button>
        <h1 className="text-text-primary-light dark:text-text-primary-dark text-xl font-bold">My Bookings</h1>
        <div className="w-10"></div>
      </header>
      <div className="flex px-4 py-3 gap-2 overflow-x-auto">
        {['all', 'pending', 'accepted', 'completed'].map((tab) => (
          <button key={tab} onClick={() => setFilter(tab as any)} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${filter === tab ? 'bg-primary text-white' : 'bg-card-light dark:bg-card-dark'}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
        ))}
      </div>
      <main className="flex-1 space-y-3 px-4 pb-24">
        {loading ? <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div> : filteredBookings.length === 0 ? <div className="flex flex-col items-center justify-center py-12 text-center"><span className="material-symbols-outlined text-6xl mb-4 text-text-secondary-light dark:text-text-secondary-dark">event_busy</span><p className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">No bookings found</p><p className="text-sm text-text-secondary-light dark:text-text-secondary-dark px-4">Start browsing sitters to make your first booking!</p></div> : filteredBookings.map((booking) => (
          <div key={booking.id} className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div><p className="text-lg font-bold">{booking.walker_name}</p><p className="text-sm">{booking.dog_name}</p></div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-base">calendar_today</span><span>{new Date(booking.booking_date).toLocaleDateString()}</span></div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-base">schedule</span><span>{booking.start_time} • {booking.duration_hours}h</span></div>
            </div>
            {/* Show Release Payment button when service completed and payment held */}
            {(booking.status as string) === 'completed' && (booking as any).payment_status === 'held' && currentUser?.id === (booking as any).owner_id && (
              <div className="flex gap-2 pt-2">
                <Button onClick={() => handleReleasePayment(booking.id)} className="flex-1 bg-primary text-white">Release Payment</Button>
              </div>
            )}
            
            {/* Show Pay Now button when booking confirmed but not paid (OWNER) */}
            {(booking.status as string) === 'confirmed' && (!(booking as any).payment_status || (booking as any).payment_status === 'pending') && currentUser?.id === (booking as any).owner_id && (
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={() => navigate(`/payment?bookingId=${booking.id}&amount=${booking.total_amount}`)} 
                  className="flex-1 bg-primary text-white"
                >
                  💳 Pay Now - €{booking.total_amount.toFixed(2)}
                </Button>
              </div>
            )}
            
            {/* Show Cancel & Refund button when requested and payment held */}
            {(booking.status as string) === 'requested' && (booking as any).payment_status === 'held' && (
              <div className="flex gap-2 pt-2">
                <Button onClick={() => handleRefund(booking.id)} variant="destructive" className="flex-1">Cancel & Refund</Button>
              </div>
            )}
            
            {/* Show Accept/Decline buttons when booking is requested (for SITTER) */}
            {(booking.status as string) === 'requested' && currentUser?.id === (booking as any).sitter_id && (
              <div className="flex gap-2 pt-2">
                <Button onClick={() => handleAcceptBooking(booking.id)} className="flex-1 bg-primary text-white">Accept</Button>
                <Button onClick={() => handleCancelBooking(booking.id)} variant="outline" className="flex-1">Decline</Button>
              </div>
            )}
            
            {/* Show waiting message when confirmed but already paid */}
            {(booking.status as string) === 'confirmed' && (booking as any).payment_status === 'held' && (
              <div className="pt-2 text-sm text-center text-green-600 dark:text-green-400">
                ✓ Payment secured - Waiting for service
              </div>
            )}
          </div>
        ))}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default BookingsPage;
