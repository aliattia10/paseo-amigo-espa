import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount';
import BottomNavigation from '@/components/ui/BottomNavigation';
import { playNotificationSound } from '@/lib/sounds';
import i18n from '@/lib/i18n';

interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  icon: string;
  iconColor: string;
  relatedId?: string | null;
}

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const unreadNotifications = useUnreadNotificationCount();
  const [filter, setFilter] = useState<'all' | 'messages' | 'bookings'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  // Auto-mark notifications as read after a short delay when page is opened
  useEffect(() => {
    if (notifications.length === 0 || !currentUser) return;
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;

    const timer = setTimeout(async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', currentUser.id)
          .in('id', unread.map(n => n.id));
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch {
        // silent
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [notifications.length, currentUser]);

  // Play sound when new unread notifications arrive
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    if (unreadCount > 0 && notifications.length > 0) {
      // Only play on subsequent loads (not initial load)
      const hasPlayedSound = sessionStorage.getItem('notificationSoundPlayed');
      if (!hasPlayedSound) {
        playNotificationSound();
        sessionStorage.setItem('notificationSoundPlayed', 'true');
      }
    }
  }, [notifications]);

  const relativeDay = (dateStr: string): string => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 86400000);
    if (d >= todayStart) return t('common.today', 'Today');
    if (d >= yesterdayStart) return t('common.yesterday', 'Yesterday');
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const fetchNotifications = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Safety: never stay in loading longer than 8s
    const safetyId = setTimeout(() => setLoading(false), 8000);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const res = await Promise.race([
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
      ]);

      if (!res) { setNotifications([]); return; } // timed out

      const { data, error } = res as any;

      if (error) {
        setNotifications([]);
        return;
      }

      const formattedNotifications = (data || []).map((notif: any) => ({
        id: notif.id,
        type: notif.type || 'notification',
        title: notif.title,
        description: notif.message,
        time: relativeDay(notif.created_at),
        isRead: notif.read === true,
        icon: getIconForType(notif.type),
        iconColor: getIconColorForType(notif.type),
        relatedId: notif.related_id ?? null,
      }));

      setNotifications(formattedNotifications);
    } catch {
      setNotifications([]);
    } finally {
      clearTimeout(safetyId);
      setLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'booking_request': return 'calendar_add_on';
      case 'booking_status_update': return 'task_alt';
      case 'message': return 'chat_bubble';
      case 'review': return 'star';
      default: return 'notifications';
    }
  };

  const getIconColorForType = (type: string) => {
    switch (type) {
      case 'booking_request': return 'text-primary';
      case 'booking_status_update': return 'text-medium-jungle';
      case 'message': return 'text-blue-500';
      case 'review': return 'text-secondary';
      default: return 'text-gray-500';
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Get all unread notification IDs
      const unreadNotifs = notifications.filter(n => !n.isRead);
      
      if (unreadNotifs.length === 0) {
        toast({
          title: t('notifications.noUnread', 'No unread notifications'),
          description: t('notifications.allRead', 'All notifications are already marked as read'),
        });
        return;
      }
      
      // Update each notification
      for (const notif of unreadNotifs) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notif.id);
      }

      // Update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      
      toast({
        title: t('common.success'),
        description: t('notifications.markedAsRead', { count: unreadNotifs.length }),
      });
    } catch (error: any) {
      console.error('Error marking notifications as read:', error);
      toast({
        title: t('common.error'),
        description: t('notifications.markFailed'),
        variant: 'destructive',
      });
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'messages') return notif.type === 'message';
    if (filter === 'bookings') return (
      notif.type === 'booking' ||
      notif.type === 'booking_request' ||
      notif.type === 'booking_status_update' ||
      notif.type === 'booking_confirmed' ||
      notif.type === 'payment'
    );
    return true;
  });

  const todayLabel = t('common.today', 'Today');
  const yesterdayLabel = t('common.yesterday', 'Yesterday');
  const todayNotifications = filteredNotifications.filter(n => n.time === todayLabel);
  const yesterdayNotifications = filteredNotifications.filter(n => n.time === yesterdayLabel);
  const earlierNotifications = filteredNotifications.filter(n => n.time !== todayLabel && n.time !== yesterdayLabel);

  const handleNotificationClick = (notif: Notification) => {
    const type = (notif.type || '').toLowerCase();
    if (type.includes('booking') || type === 'booking_request' || type === 'booking_status_update' || type === 'booking_confirmed' || type === 'payment' || type === 'service_completed' || type === 'completion_confirmed' || type === 'payment_released') {
      navigate('/bookings');
      return;
    }
    if (type === 'message' || type.includes('message')) {
      navigate('/messages');
      return;
    }
    if (type === 'match') {
      navigate('/messages');
      return;
    }
    if (type === 'review' || type.includes('review')) {
      navigate('/bookings');
      return;
    }
    navigate('/bookings');
  };

  const NotifRow = ({ notif }: { notif: Notification }) => (
    <div
      role="button"
      tabIndex={0}
      onClick={() => handleNotificationClick(notif)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNotificationClick(notif); }}
      className={`flex cursor-pointer items-center gap-4 px-4 py-3 min-h-[72px] justify-between hover:opacity-90 active:opacity-95 ${
        notif.isRead ? 'bg-card-light dark:bg-card-dark' : 'bg-primary/10 dark:bg-primary/20'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`${notif.iconColor} flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
          notif.isRead ? 'bg-background-light dark:bg-background-dark' : 'bg-card-light dark:bg-card-dark'
        }`}>
          <span className="material-symbols-outlined">{notif.icon}</span>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-text-primary-light dark:text-text-primary-dark text-base font-medium leading-normal line-clamp-1">
            {notif.title}
          </p>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal line-clamp-2">
            {notif.description}
          </p>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs mt-0.5">{notif.time}</p>
        </div>
      </div>
      {!notif.isRead && (
        <div className="shrink-0 flex h-7 w-7 items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative mx-auto flex h-screen max-w-md flex-col bg-background-light dark:bg-background-dark overflow-y-auto">
      {/* Top App Bar */}
      <header className="sticky top-0 z-10 flex items-center gap-2 bg-card-light/95 dark:bg-card-dark/95 px-4 py-3 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="shrink-0 -ml-1 rounded-lg p-1 text-text-primary-light dark:text-text-primary-dark hover:bg-black/5 dark:hover:bg-white/10"
          aria-label={t('common.back', 'Back')}
        >
          <span className="material-symbols-outlined text-2xl leading-none">arrow_back</span>
        </button>
        <h1 className="min-w-0 flex-1 text-center text-text-primary-light dark:text-text-primary-dark text-xl font-bold leading-tight tracking-[-0.015em] truncate">
          {t('notifications.title')}
        </h1>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={markAllAsRead}
            className="flex items-center gap-1 px-2 py-1.5 sm:px-3 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors text-xs sm:text-sm font-medium"
          >
            <span className="material-symbols-outlined text-base">done_all</span>
            <span className="hidden sm:inline">{t('notifications.markAllRead', 'Mark all read')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const languages = ['en', 'es', 'fr'];
              const currentIndex = languages.indexOf(i18n.language);
              const nextIndex = (currentIndex + 1) % languages.length;
              i18n.changeLanguage(languages[nextIndex]);
            }}
            className="px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs font-medium text-gray-700 dark:text-gray-300"
          >
            {i18n.language.toUpperCase()}
          </button>
        </div>
      </header>

      {/* Segmented Buttons */}
      <div className="flex px-4 py-3">
        <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-background-light dark:bg-background-dark p-1 ring-1 ring-border-light dark:ring-border-dark">
          <label className={`flex h-full grow cursor-pointer items-center justify-center overflow-hidden rounded-md px-2 text-sm font-medium leading-normal ${
            filter === 'all' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary-light dark:text-text-secondary-dark'
          }`}>
            <span className="truncate">{t('notifications.filter.all')}</span>
            <input 
              checked={filter === 'all'} 
              onChange={() => setFilter('all')}
              className="invisible w-0" 
              type="radio" 
              value="All"
            />
          </label>
          <label className={`flex h-full grow cursor-pointer items-center justify-center overflow-hidden rounded-md px-2 text-sm font-medium leading-normal ${
            filter === 'messages' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary-light dark:text-text-secondary-dark'
          }`}>
            <span className="truncate">{t('notifications.filter.messages')}</span>
            <input 
              checked={filter === 'messages'} 
              onChange={() => setFilter('messages')}
              className="invisible w-0" 
              type="radio" 
              value="Messages"
            />
          </label>
          <label className={`flex h-full grow cursor-pointer items-center justify-center overflow-hidden rounded-md px-2 text-sm font-medium leading-normal ${
            filter === 'bookings' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary-light dark:text-text-secondary-dark'
          }`}>
            <span className="truncate">{t('notifications.filter.bookings')}</span>
            <input 
              checked={filter === 'bookings'} 
              onChange={() => setFilter('bookings')}
              className="invisible w-0" 
              type="radio" 
              value="Bookings"
            />
          </label>
        </div>
      </div>

      <main className="flex-1 space-y-4 pb-24">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Empty State */}
        {filteredNotifications.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-background-light dark:bg-background-dark rounded-full p-6 mb-4">
              <span className="material-symbols-outlined text-6xl text-text-secondary-light dark:text-text-secondary-dark">
                notifications_off
              </span>
            </div>
            <h3 className="text-text-primary-light dark:text-text-primary-dark text-xl font-bold mb-2">
              {t('notifications.emptyTitle', 'No notifications yet')}
            </h3>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-center text-sm">
              {t('notifications.emptyDescription', 'When you receive bookings, matches, or messages, they\'ll appear here')}
            </p>
          </div>
        )}

        {/* Today Section */}
        {todayNotifications.length > 0 && (
          <>
            <h3 className="text-text-primary-light dark:text-text-primary-dark px-4 pb-1 pt-2 text-base font-bold leading-tight tracking-[-0.015em]">
              {t('common.today', 'Today')}
            </h3>
            <div className="flex flex-col gap-2">
              {todayNotifications.map((notif) => (
                <NotifRow key={notif.id} notif={notif} />
              ))}
            </div>
          </>
        )}

        {/* Yesterday Section */}
        {yesterdayNotifications.length > 0 && (
          <>
            <h3 className="text-text-primary-light dark:text-text-primary-dark px-4 pb-1 pt-2 text-base font-bold leading-tight tracking-[-0.015em]">
              {t('common.yesterday', 'Yesterday')}
            </h3>
            <div className="flex flex-col gap-2">
              {yesterdayNotifications.map((notif) => (
                <NotifRow key={notif.id} notif={notif} />
              ))}
            </div>
          </>
        )}

        {/* Earlier Section */}
        {earlierNotifications.length > 0 && (
          <>
            <h3 className="text-text-primary-light dark:text-text-primary-dark px-4 pb-1 pt-2 text-base font-bold leading-tight tracking-[-0.015em]">
              {t('common.earlier', 'Earlier')}
            </h3>
            <div className="flex flex-col gap-2">
              {earlierNotifications.map((notif) => (
                <NotifRow key={notif.id} notif={notif} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation unreadNotifications={unreadNotifications} />
    </div>
  );
};

export default NotificationsPage;
