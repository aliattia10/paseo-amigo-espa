import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/ui/BottomNavigation';

interface Notification {
  id: string;
  type: 'booking' | 'match' | 'message' | 'review';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  icon: string;
  iconColor: string;
}

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'messages' | 'bookings'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, show sample data
        if (error.message.includes('does not exist')) {
          setNotifications(sampleNotifications);
          setLoading(false);
          return;
        }
        throw error;
      }

      const formattedNotifications = data?.map((notif: any) => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        description: notif.message,
        time: new Date(notif.created_at).toLocaleDateString(),
        isRead: notif.is_read || false,
        icon: getIconForType(notif.type),
        iconColor: getIconColorForType(notif.type)
      })) || [];

      setNotifications(formattedNotifications);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      setNotifications(sampleNotifications);
    } finally {
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
      case 'booking_status_update': return 'text-green-500';
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
          title: 'No unread notifications',
          description: 'All notifications are already marked as read',
        });
        setShowMenu(false);
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
      setShowMenu(false);
      
      toast({
        title: t('common.success'),
        description: `Marked ${unreadNotifs.length} notification${unreadNotifs.length > 1 ? 's' : ''} as read`,
      });
    } catch (error: any) {
      console.error('Error marking notifications as read:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to mark notifications as read',
        variant: 'destructive',
      });
    }
  };

  const sampleNotifications: Notification[] = [
    {
      id: '1',
      type: 'booking',
      title: 'New booking request from Jane D.',
      description: 'Request for Dec 18 - Dec 22',
      time: 'Today',
      isRead: false,
      icon: 'calendar_add_on',
      iconColor: 'text-primary'
    },
    {
      id: '2',
      type: 'match',
      title: 'Alex P. is a new match for Buddy!',
      description: 'Tap to view their profile.',
      time: 'Today',
      isRead: false,
      icon: 'pets',
      iconColor: 'text-secondary'
    },
    {
      id: '3',
      type: 'booking',
      title: 'Your booking with Liam is confirmed!',
      description: 'Dec 15 at 6:00 PM',
      time: 'Yesterday',
      isRead: true,
      icon: 'task_alt',
      iconColor: 'text-text-primary-light dark:text-text-primary-dark'
    },
    {
      id: '4',
      type: 'message',
      title: 'Sarah K. sent you a new message.',
      description: '"Hey! Just wanted to confirm..."',
      time: 'Yesterday',
      isRead: true,
      icon: 'chat_bubble',
      iconColor: 'text-text-primary-light dark:text-text-primary-dark'
    },
    {
      id: '5',
      type: 'review',
      title: 'How was your sit with Chloe?',
      description: 'Leave a review to help others.',
      time: 'Yesterday',
      isRead: true,
      icon: 'reviews',
      iconColor: 'text-text-primary-light dark:text-text-primary-dark'
    }
  ];

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'messages') return notif.type === 'message';
    if (filter === 'bookings') return notif.type === 'booking';
    return true;
  });

  const todayNotifications = filteredNotifications.filter(n => n.time === 'Today');
  const yesterdayNotifications = filteredNotifications.filter(n => n.time === 'Yesterday');

  return (
    <div className="relative mx-auto flex h-screen max-w-md flex-col bg-background-light dark:bg-background-dark overflow-y-auto">
      {/* Top App Bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-card-light/80 dark:bg-card-dark/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-text-primary-light dark:text-text-primary-dark text-xl font-bold leading-tight tracking-[-0.015em]">
          Notifications
        </h1>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-text-primary-light dark:text-text-primary-dark flex h-10 w-10 items-center justify-center"
          >
            <span className="material-symbols-outlined">more_vert</span>
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-12 bg-card-light dark:bg-card-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark min-w-[160px] z-20">
              <button
                onClick={markAllAsRead}
                className="w-full px-4 py-3 text-left text-text-primary-light dark:text-text-primary-dark hover:bg-background-light dark:hover:bg-background-dark rounded-lg flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">done_all</span>
                Mark all as read
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Segmented Buttons */}
      <div className="flex px-4 py-3">
        <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-background-light dark:bg-background-dark p-1 ring-1 ring-border-light dark:ring-border-dark">
          <label className={`flex h-full grow cursor-pointer items-center justify-center overflow-hidden rounded-md px-2 text-sm font-medium leading-normal ${
            filter === 'all' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary-light dark:text-text-secondary-dark'
          }`}>
            <span className="truncate">All</span>
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
            <span className="truncate">Messages</span>
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
            <span className="truncate">Bookings</span>
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
        {/* Today Section */}
        {todayNotifications.length > 0 && (
          <>
            <h3 className="text-text-primary-light dark:text-text-primary-dark px-4 pb-1 pt-2 text-base font-bold leading-tight tracking-[-0.015em]">
              Today
            </h3>
            <div className="flex flex-col gap-2">
              {todayNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`flex cursor-pointer items-center gap-4 px-4 py-3 min-h-[72px] justify-between ${
                    notif.isRead 
                      ? 'bg-card-light dark:bg-card-dark' 
                      : 'bg-primary/10 dark:bg-primary/20'
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
                    </div>
                  </div>
                  <div className="shrink-0">
                    {!notif.isRead && (
                      <div className="flex h-7 w-7 items-center justify-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Yesterday Section */}
        {yesterdayNotifications.length > 0 && (
          <>
            <h3 className="text-text-primary-light dark:text-text-primary-dark px-4 pb-1 pt-2 text-base font-bold leading-tight tracking-[-0.015em]">
              Yesterday
            </h3>
            <div className="flex flex-col gap-2">
              {yesterdayNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  className="flex cursor-pointer items-center gap-4 bg-card-light dark:bg-card-dark px-4 py-3 min-h-[72px] justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`${notif.iconColor} flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background-light dark:bg-background-dark`}>
                      <span className="material-symbols-outlined">{notif.icon}</span>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-text-primary-light dark:text-text-primary-dark text-base font-medium leading-normal line-clamp-1">
                        {notif.title}
                      </p>
                      <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal line-clamp-2">
                        {notif.description}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
                      {notif.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default NotificationsPage;
