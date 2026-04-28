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
        const { count: unreadCount, error } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', currentUser.id)
          .neq('read', true);

        if (error) {
          return;
        }
        setCount(unreadCount ?? 0);
      } catch {
        // Keep last known good value during transient network issues.
      }
    };

    fetchCount();

    const channel = supabase
      .channel('notifications-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUser.id}` }, (payload) => {
        const row = payload.new as { read?: boolean | null; user_id?: string } | null;
        const oldRow = payload.old as { read?: boolean | null; user_id?: string } | null;
        if (payload.eventType === 'INSERT' && row?.user_id === currentUser.id && row?.read !== true) {
          setCount((prev) => prev + 1);
          return;
        }
        if (payload.eventType === 'UPDATE') {
          const wasUnread = oldRow?.read !== true;
          const isUnread = row?.read !== true;
          if (wasUnread && !isUnread) setCount((prev) => Math.max(0, prev - 1));
          else if (!wasUnread && isUnread) setCount((prev) => prev + 1);
          return;
        }
        fetchCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  return count;
}
