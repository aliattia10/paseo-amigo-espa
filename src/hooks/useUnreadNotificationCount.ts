import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Returns the count of unread notifications for the current user.
 * Use this to pass unreadNotifications to BottomNavigation so the badge is correct.
 */
export function useUnreadNotificationCount(): number {
  const { currentUser } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!currentUser?.id) {
      setCount(0);
      return;
    }

    const fetchCount = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('id, read')
          .eq('user_id', currentUser.id);

        if (error) {
          setCount(0);
          return;
        }
        const unread = (data || []).filter((n: { read?: boolean | null }) => n.read !== true);
        setCount(unread.length);
      } catch {
        setCount(0);
      }
    };

    fetchCount();

    const channel = supabase
      .channel('notifications-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUser.id}` }, () => {
        fetchCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  return count;
}
