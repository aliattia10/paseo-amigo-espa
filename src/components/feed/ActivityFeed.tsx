import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Heart, MessageCircle, PawPrint, Star, User, TrendingUp, Clock } from 'lucide-react';
import { getPublicActivities, subscribeToActivities } from '@/lib/activity-services';

interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  activityType: 'walk_completed' | 'new_match' | 'review_received' | 'profile_updated' | 'new_dog';
  activityData: any;
  createdAt: Date;
}

const ActivityFeed: React.FC = () => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load activities from Supabase
  useEffect(() => {
    const loadActivities = async () => {
      try {
        const data = await getPublicActivities(50);
        
        // Transform data to match ActivityItem interface
        const transformedActivities: ActivityItem[] = data.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          userName: item.user?.name || 'Unknown User',
          userImage: item.user?.profile_image,
          activityType: item.activity_type,
          activityData: item.activity_data,
          createdAt: new Date(item.created_at)
        }));
        
        setActivities(transformedActivities);
      } catch (error) {
        console.error('Error loading activities:', error);
        toast({
          title: t('common.error'),
          description: 'Failed to load activity feed',
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadActivities();

    // Subscribe to real-time updates
    const channel = subscribeToActivities((newActivity: any) => {
      const transformedActivity: ActivityItem = {
        id: newActivity.id,
        userId: newActivity.user_id,
        userName: newActivity.user?.name || 'Unknown User',
        userImage: newActivity.user?.profile_image,
        activityType: newActivity.activity_type,
        activityData: newActivity.activity_data,
        createdAt: new Date(newActivity.created_at)
      };
      
      setActivities((prev) => [transformedActivity, ...prev]);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [t, toast]);

  const getActivityIcon = (type: ActivityItem['activityType']) => {
    const iconStyle = { fontVariationSettings: '"FILL" 1, "wght" 600' };
    switch (type) {
      case 'walk_completed':
        return <span className="material-symbols-outlined" style={iconStyle}>hiking</span>;
      case 'new_match':
        return <span className="material-symbols-outlined" style={iconStyle}>favorite</span>;
      case 'review_received':
        return <span className="material-symbols-outlined" style={iconStyle}>star</span>;
      case 'profile_updated':
        return <span className="material-symbols-outlined" style={iconStyle}>person</span>;
      case 'new_dog':
        return <span className="material-symbols-outlined" style={iconStyle}>pets</span>;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.activityType) {
      case 'walk_completed':
        return `completed a ${activity.activityData.duration}-minute walk with ${activity.activityData.dogName} 🐕`;
      case 'new_match':
        return `matched with ${activity.activityData.matchedWith} 💕`;
      case 'review_received':
        return `received a ${activity.activityData.rating}-star review`;
      case 'profile_updated':
        return `updated their profile`;
      case 'new_dog':
        return `added a new dog: ${activity.activityData.dogName} (${activity.activityData.breed})`;
      default:
        return 'had an activity';
    }
  };

  const getActivityColor = (type: ActivityItem['activityType']) => {
    switch (type) {
      case 'walk_completed':
        return 'from-green-500 to-emerald-600';
      case 'new_match':
        return 'from-pink-500 to-rose-600';
      case 'review_received':
        return 'from-yellow-500 to-orange-600';
      case 'profile_updated':
        return 'from-blue-500 to-indigo-600';
      case 'new_dog':
        return 'from-purple-500 to-violet-600';
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stitch-bg-light p-4 flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stitch-primary mx-auto mb-4"></div>
          <p className="text-stitch-text-secondary-light">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stitch-bg-light p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-stitch-text-primary-light flex items-center gap-3 font-display">
            <span className="material-symbols-outlined text-stitch-primary text-4xl" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>trending_up</span>
            {t('nav.feed')}
          </h1>
          <p className="text-stitch-text-secondary-light mt-2">
            See what's happening in your community
          </p>
        </div>

        {/* Activities */}
        {activities.length === 0 ? (
          <Card className="border-2 border-dashed border-stitch-border-light hover:border-stitch-primary transition-colors rounded-3xl">
            <CardContent className="p-12 text-center">
              <span className="material-symbols-outlined text-7xl text-stitch-text-secondary-light mx-auto mb-6 block opacity-50">trending_up</span>
              <h3 className="text-xl font-bold text-stitch-text-primary-light mb-2 font-display">
                No activity yet
              </h3>
              <p className="text-stitch-text-secondary-light">
                Connect with walkers and owners to see their activities here
              </p>
            </CardContent>
          </Card>
        ) : (
          activities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-lg transition-all duration-300 overflow-hidden border-0 rounded-3xl">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <Avatar className="w-14 h-14 ring-2 ring-stitch-border-light shadow-sm rounded-2xl">
                    <AvatarImage src={activity.userImage} />
                    <AvatarFallback className={`bg-gradient-to-br ${getActivityColor(activity.activityType)} text-white font-semibold rounded-2xl`}>
                      {activity.userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-stitch-text-primary-light font-display">
                        {activity.userName}
                      </span>
                      <div className={`p-1.5 rounded-xl bg-gradient-to-br ${getActivityColor(activity.activityType)} shadow-sm`}>
                        {React.cloneElement(getActivityIcon(activity.activityType), {
                          className: 'w-4 h-4 text-white'
                        })}
                      </div>
                    </div>
                    <p className="text-stitch-text-primary-light text-sm mb-2">
                      {getActivityText(activity)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-stitch-text-secondary-light">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {getTimeAgo(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;

