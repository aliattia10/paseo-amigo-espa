import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AvailabilitySlot {
  id: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'booked' | 'unavailable';
}

const AvailabilityPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    startTime: '09:00',
    endTime: '17:00',
  });

  useEffect(() => {
    fetchAvailability();
  }, [selectedDate]);

  const fetchAvailability = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('sitter_id', currentUser?.id)
        .gte('start_time', startOfDay.toISOString())
        .lte('end_time', endOfDay.toISOString())
        .order('start_time');

      if (error) {
        // If table doesn't exist, show empty state instead of error
        if (error.message.includes('does not exist') || error.message.includes('not find')) {
          console.warn('Availability table not found. Please run database migrations.');
          setSlots([]);
          setLoading(false);
          return;
        }
        throw error;
      }
      setSlots(data || []);
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

  const handleAddSlot = async () => {
    try {
      const startDateTime = new Date(`${selectedDate}T${newSlot.startTime}`);
      const endDateTime = new Date(`${selectedDate}T${newSlot.endTime}`);

      if (endDateTime <= startDateTime) {
        toast({
          title: t('common.error'),
          description: 'End time must be after start time',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.rpc('add_availability_slot', {
        p_sitter_id: currentUser?.id,
        p_start_time: startDateTime.toISOString(),
        p_end_time: endDateTime.toISOString(),
      });

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: 'Availability slot added',
      });

      setShowAddSlot(false);
      fetchAvailability();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: 'Availability slot removed',
      });

      fetchAvailability();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'booked':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'unavailable':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

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
          My Availability
        </h2>
        <div className="flex w-12 items-center justify-end"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4 pb-8">
        {/* Date Selector */}
        <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark"
          />
        </div>

        {/* Add Slot Button */}
        <Button
          onClick={() => setShowAddSlot(!showAddSlot)}
          className="w-full bg-primary text-white"
        >
          <span className="material-symbols-outlined mr-2">add</span>
          Add Availability Slot
        </Button>

        {/* Add Slot Form */}
        {showAddSlot && (
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm space-y-4">
            <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark">
              New Availability Slot
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  className="w-full p-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  className="w-full p-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddSlot}
                className="flex-1 bg-primary text-white"
              >
                Save
              </Button>
              <Button
                onClick={() => setShowAddSlot(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Availability Slots List */}
        <div className="space-y-3">
          <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark">
            Slots for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : slots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl bg-card-light dark:bg-card-dark p-6">
              <span className="material-symbols-outlined text-6xl mb-4 text-text-secondary-light dark:text-text-secondary-dark">
                event_busy
              </span>
              <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                No availability slots for this date
              </p>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                Add slots to let dog owners know when you're free
              </p>
            </div>
          ) : (
            slots.map((slot) => (
              <div
                key={slot.id}
                className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">
                      schedule
                    </span>
                    <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(slot.status)}`}>
                    {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                  </span>
                </div>

                {slot.status === 'available' && (
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Quick Add Buttons */}
        <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
          <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark mb-3">
            Quick Add
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => {
                setNewSlot({ startTime: '09:00', endTime: '12:00' });
                setShowAddSlot(true);
              }}
              variant="outline"
              className="text-sm"
            >
              Morning (9-12)
            </Button>
            <Button
              onClick={() => {
                setNewSlot({ startTime: '13:00', endTime: '17:00' });
                setShowAddSlot(true);
              }}
              variant="outline"
              className="text-sm"
            >
              Afternoon (1-5)
            </Button>
            <Button
              onClick={() => {
                setNewSlot({ startTime: '17:00', endTime: '20:00' });
                setShowAddSlot(true);
              }}
              variant="outline"
              className="text-sm"
            >
              Evening (5-8)
            </Button>
            <Button
              onClick={() => {
                setNewSlot({ startTime: '09:00', endTime: '17:00' });
                setShowAddSlot(true);
              }}
              variant="outline"
              className="text-sm"
            >
              Full Day (9-5)
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AvailabilityPage;
