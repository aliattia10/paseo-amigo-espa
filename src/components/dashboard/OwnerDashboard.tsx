import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { getDogsByOwner, getWalkRequestsByOwner } from '@/lib/supabase-services';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { 
  Heart, 
  MapPin, 
  Clock, 
  Plus, 
  LogOut, 
  User, 
  Settings, 
  MessageCircle, 
  Crown, 
  Search, 
  ArrowLeftRight,
  PawPrint,
  Calendar,
  Star,
  TrendingUp,
  Bell,
  Sparkles,
  Users,
  Activity,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Dog, WalkRequest } from '@/types';
import HomePage from './HomePage';
import RoleSwitch from '@/components/ui/RoleSwitch';
import DogManagement from '@/components/dog/DogManagement';
import WalkerProfile from '@/components/walker/WalkerProfile';
import MessagingPage from '@/components/messaging/MessagingPage';
import ProfileEditModal from '@/components/profile/ProfileEditModal';
import MainNavigation from '@/components/ui/MainNavigation';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import ProfileSettings from '@/components/profile/ProfileSettings';
import ActivityFeed from '@/components/feed/ActivityFeed';
import NearbyWalkers from '@/components/nearby/NearbyWalkers';

const OwnerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { userProfile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [recentWalks, setRecentWalks] = useState<WalkRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'home' | 'role-switch' | 'dogs' | 'walker-profile' | 'messages' | 'profile-edit' | 'nearby' | 'feed' | 'profile-settings'>('dashboard');

  useEffect(() => {
    const loadData = async () => {
      if (!userProfile) return;

      setLoading(true);
      try {
        const [dogsData, walksData] = await Promise.all([
          getDogsByOwner(userProfile.id),
          getWalkRequestsByOwner(userProfile.id)
        ]);

        setDogs(dogsData);
        setRecentWalks(walksData.slice(0, 3));
      } catch (error) {
        toast({
          title: t('common.error'),
          description: t('dashboard.errorLoadingData'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentView === 'dashboard') {
      loadData();
    }
  }, [userProfile, toast, currentView, t]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: t('dashboard.sessionClosed'),
        description: t('dashboard.sessionClosedSuccess'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('dashboard.logoutError'),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stitch-bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stitch-primary mx-auto mb-4"></div>
          <p className="text-stitch-text-secondary-light">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Show HomePage (Tinder-like) when selected
  if (currentView === 'home') {
    return <HomePage />;
  }

  // Show Role Switch component
  if (currentView === 'role-switch') {
    return (
      <div className="min-h-screen bg-stitch-bg-light flex items-center justify-center p-4">
        <RoleSwitch onRoleChange={() => setCurrentView('home')} />
      </div>
    );
  }

  // Show Dog Management component
  if (currentView === 'dogs') {
    return <DogManagement />;
  }

  // Show Walker Profile component
  if (currentView === 'walker-profile') {
    return <WalkerProfile />;
  }

  // Show Messaging component
  if (currentView === 'messages') {
    return <MessagingPage />;
  }

  // Show Profile Edit Modal
  if (currentView === 'profile-edit') {
    return (
      <div className="min-h-screen bg-stitch-bg-light flex items-center justify-center p-4">
        <ProfileEditModal 
          onClose={() => setCurrentView('dashboard')} 
          onSave={() => {
            setCurrentView('dashboard');
            // Refresh user profile data
            window.location.reload();
          }}
        />
      </div>
    );
  }

  // Show Profile Settings
  if (currentView === 'profile-settings') {
    return (
      <>
        <ProfileSettings onClose={() => setCurrentView('dashboard')} />
        <MainNavigation 
          activeTab="profile" 
          onTabChange={(tab) => {
            if (tab === 'home') setCurrentView('home');
            else if (tab === 'messages') setCurrentView('messages');
            else if (tab === 'feed') setCurrentView('feed');
            else if (tab === 'nearby') setCurrentView('nearby');
            else if (tab === 'profile') setCurrentView('profile-settings');
          }}
        />
      </>
    );
  }

  // Show Activity Feed
  if (currentView === 'feed') {
    return (
      <>
        <ActivityFeed />
        <MainNavigation 
          activeTab="feed" 
          onTabChange={(tab) => {
            if (tab === 'home') setCurrentView('home');
            else if (tab === 'messages') setCurrentView('messages');
            else if (tab === 'feed') setCurrentView('feed');
            else if (tab === 'nearby') setCurrentView('nearby');
            else if (tab === 'profile') setCurrentView('profile-settings');
          }}
        />
      </>
    );
  }

  // Show Nearby Walkers
  if (currentView === 'nearby') {
    return (
      <>
        <NearbyWalkers onMatch={(walkerId) => {
          console.log('Matched with walker:', walkerId);
          // TODO: Create match in database
        }} />
        <MainNavigation 
          activeTab="nearby" 
          onTabChange={(tab) => {
            if (tab === 'home') setCurrentView('home');
            else if (tab === 'messages') setCurrentView('messages');
            else if (tab === 'feed') setCurrentView('feed');
            else if (tab === 'nearby') setCurrentView('nearby');
            else if (tab === 'profile') setCurrentView('profile-settings');
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-stitch-bg-light">
      {/* Enhanced Header with Material Design */}
      <div className="bg-stitch-card-light shadow-md border-b border-stitch-border-light sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-12 h-12 ring-2 ring-stitch-primary shadow-sm rounded-2xl">
                  <AvatarImage src={userProfile?.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"} />
                  <AvatarFallback className="bg-gradient-to-br from-stitch-primary to-stitch-secondary text-white font-semibold rounded-2xl">
                    {userProfile?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-stitch-card-light rounded-full"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold font-display text-stitch-text-primary-light">
                  {t('dashboard.hello')}, {userProfile?.name?.split(' ')[0]}! 👋
                </h1>
                <div className="flex items-center gap-1 text-sm text-stitch-text-secondary-light">
                  <span className="material-symbols-outlined text-stitch-primary text-base">location_on</span>
                  <span>{userProfile?.city}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setCurrentView('home')}
                title={t('dashboard.searchCompanions')}
                className="relative rounded-xl"
              >
                <span className="material-symbols-outlined">search</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setCurrentView('messages')}
                title={t('dashboard.messages')}
                className="relative rounded-xl"
              >
                <span className="material-symbols-outlined">chat_bubble_outline</span>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </Button>
              {userProfile?.userType === 'owner' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setCurrentView('dogs')}
                  title={t('dashboard.myDogs')}
                  className="rounded-xl"
                >
                  <span className="material-symbols-outlined">pets</span>
                </Button>
              )}
              {userProfile?.userType === 'walker' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setCurrentView('walker-profile')}
                  title={t('dashboard.myProfile')}
                  className="rounded-xl"
                >
                  <span className="material-symbols-outlined">person</span>
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setCurrentView('profile-edit')} 
                title={t('dashboard.editProfile')}
                className="rounded-xl"
              >
                <span className="material-symbols-outlined">settings</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate('/subscription')} title={t('dashboard.premium')} className="rounded-xl">
                <span className="material-symbols-outlined">workspace_premium</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setCurrentView('role-switch')} title={t('dashboard.changeRole')} className="rounded-xl">
                <span className="material-symbols-outlined">swap_horiz</span>
              </Button>
              <LanguageSwitcher />
              <Button variant="ghost" size="icon" onClick={handleLogout} title={t('auth.logout')} className="rounded-xl">
                <span className="material-symbols-outlined">logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-stitch-primary to-stitch-secondary rounded-3xl p-8 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2 font-display">{t('dashboard.yourPerfectCompanion')} 🐾</h2>
                <p className="text-white/90 mb-6 font-medium">{t('dashboard.findTrustedWalkers')}</p>
                <Button 
                  size="lg" 
                  className="bg-white text-stitch-primary hover:bg-stitch-bg-light font-semibold rounded-2xl shadow-lg"
                  onClick={() => setCurrentView('home')}
                >
                  <span className="material-symbols-outlined mr-2">auto_awesome</span>
                  {t('dashboard.searchNow')}
                </Button>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="material-symbols-outlined text-6xl text-white">pets</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-100 cursor-pointer group rounded-3xl" onClick={() => setCurrentView('home')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                <span className="material-symbols-outlined text-white text-3xl">favorite</span>
              </div>
              <h3 className="text-lg font-bold text-stitch-text-primary-light mb-2 font-display">{t('dashboard.findCompanion')}</h3>
              <p className="text-sm text-stitch-text-secondary-light">{t('dashboard.connectWithVerified')}</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-cyan-100 cursor-pointer group rounded-3xl" onClick={() => setCurrentView('dogs')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-stitch-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                <span className="material-symbols-outlined text-white text-3xl">add</span>
              </div>
              <h3 className="text-lg font-bold text-stitch-text-primary-light mb-2 font-display">{t('dashboard.addPet')}</h3>
              <p className="text-sm text-stitch-text-secondary-light">{t('dashboard.registerPetToFind')}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-100 cursor-pointer group rounded-3xl" onClick={() => navigate('/messages')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                <span className="material-symbols-outlined text-white text-3xl">chat_bubble_outline</span>
              </div>
              <h3 className="text-lg font-bold text-stitch-text-primary-light mb-2 font-display">{t('dashboard.messages')}</h3>
              <p className="text-sm text-stitch-text-secondary-light">{t('dashboard.connectCommunity')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Dogs Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-stitch-text-primary-light font-display">{t('dashboard.myCompanions')} 🐾</h2>
            <Button 
              onClick={() => setCurrentView('dogs')}
              className="bg-gradient-to-r from-stitch-primary to-stitch-secondary hover:from-stitch-primary/90 hover:to-stitch-secondary/90 text-white rounded-2xl shadow-md"
            >
              <span className="material-symbols-outlined mr-2">add</span>
              {t('dashboard.addDog')}
            </Button>
          </div>
          
          {dogs.length === 0 ? (
            <Card className="border-2 border-dashed border-stitch-border-light hover:border-stitch-primary transition-colors rounded-3xl">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-stitch-bg-light rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-5xl text-stitch-text-secondary-light">pets</span>
                </div>
                <h3 className="text-xl font-bold text-stitch-text-primary-light mb-2 font-display">{t('dashboard.addFirstCompanion')}</h3>
                <p className="text-stitch-text-secondary-light mb-6 max-w-md mx-auto">
                  {t('dashboard.registerDogToFind')}
                </p>
                <Button 
                  size="lg"
                  onClick={() => setCurrentView('dogs')}
                  className="bg-gradient-to-r from-stitch-primary to-stitch-secondary hover:from-stitch-primary/90 hover:to-stitch-secondary/90 text-white rounded-2xl shadow-md"
                >
                  <span className="material-symbols-outlined mr-2">add</span>
                  {t('dashboard.addFirstDog')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dogs.map((dog, index) => {
                const dogImages = [
                  "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop",
                  "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop",
                  "https://images.unsplash.com/photo-1547407139-3c921a71905c?w=300&h=300&fit=crop",
                  "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop",
                  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop"
                ];
                const dogImage = dog.imageUrl || dogImages[index % dogImages.length];
                
                return (
                  <Card key={dog.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-stitch-card-light overflow-hidden cursor-pointer rounded-3xl">
                    <div className="relative">
                      <div className="h-48 bg-gradient-to-br from-stitch-primary/10 to-stitch-secondary/10 relative overflow-hidden">
                        <img 
                          src={dogImage} 
                          alt={dog.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-green-500 text-white border-0 rounded-xl shadow-md">
                            <span className="material-symbols-outlined text-sm mr-1">bolt</span>
                            {t('dashboard.active')}
                          </Badge>
                        </div>
                      </div>
                      <div className="absolute -bottom-6 left-6">
                        <Avatar className="w-16 h-16 border-4 border-stitch-card-light shadow-lg rounded-2xl">
                          <AvatarImage src={dogImage} />
                          <AvatarFallback className="bg-gradient-to-br from-stitch-primary to-stitch-secondary text-white font-bold text-lg rounded-2xl">
                            {dog.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <CardContent className="pt-8 pb-4 px-6">
                      <div className="mb-3">
                        <h3 className="font-bold text-xl text-stitch-text-primary-light mb-1 font-display">{dog.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-stitch-text-secondary-light">
                          <span className="material-symbols-outlined text-base">calendar_today</span>
                          <span>{dog.age}</span>
                          <span>•</span>
                          <span>{dog.breed}</span>
                        </div>
                      </div>
                      {dog.notes && (
                        <p className="text-sm text-stitch-text-secondary-light line-clamp-2 mb-3">{dog.notes}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-yellow-400 text-base">star</span>
                          <span className="text-sm font-medium text-stitch-text-primary-light">4.8</span>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs rounded-xl">
                          {t('dashboard.viewProfile')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Walks */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-stitch-text-primary-light mb-6 font-display">{t('dashboard.recentActivity')} 📅</h2>
          {recentWalks.length === 0 ? (
            <Card className="border-2 border-dashed border-stitch-border-light hover:border-green-400 transition-colors rounded-3xl">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-5xl text-green-500">favorite</span>
                </div>
                <h3 className="text-xl font-bold text-stitch-text-primary-light mb-2 font-display">{t('dashboard.firstAdventure')}</h3>
                <p className="text-stitch-text-secondary-light mb-6 max-w-md mx-auto">
                  {t('dashboard.noRecentWalks')}
                </p>
                <Button 
                  size="lg"
                  onClick={() => setCurrentView('home')}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl shadow-md"
                >
                  <span className="material-symbols-outlined mr-2">favorite</span>
                  {t('dashboard.searchWalker')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentWalks.map((walk) => (
                <Card key={walk.id} className="hover:shadow-lg transition-all duration-300 border-0 bg-stitch-card-light rounded-3xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-stitch-primary to-stitch-secondary rounded-2xl flex items-center justify-center shadow-md">
                          <span className="material-symbols-outlined text-white text-3xl">favorite</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-stitch-text-primary-light font-display">{t('dashboard.walkWith')} {walk.walkerId}</h3>
                          <div className="flex items-center gap-4 text-sm text-stitch-text-secondary-light">
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">calendar_today</span>
                              <span>{walk.date.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">schedule</span>
                              <span>{walk.duration} min</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          className={`${
                            walk.status === 'completed' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                          } border-0 rounded-xl`}
                        >
                          {walk.status === 'completed' ? `✅ ${t('dashboard.completed')}` : `⏳ ${t('dashboard.inProgress')}`}
                        </Badge>
                        <Button size="sm" variant="outline" className="text-xs rounded-xl">
                          {t('dashboard.viewDetails')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300 rounded-3xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-stitch-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="material-symbols-outlined text-white text-2xl">pets</span>
              </div>
              <div className="text-3xl font-bold text-stitch-primary mb-1">{dogs.length}</div>
              <div className="text-sm text-stitch-text-secondary-light font-medium">{t('dashboard.companions')}</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300 rounded-3xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="material-symbols-outlined text-white text-2xl">check_circle</span>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {recentWalks.filter(w => w.status === 'completed').length}
              </div>
              <div className="text-sm text-stitch-text-secondary-light font-medium">{t('dashboard.completedWalks')}</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-lg transition-all duration-300 rounded-3xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="material-symbols-outlined text-white text-2xl">schedule</span>
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {recentWalks.filter(w => w.status === 'pending').length}
              </div>
              <div className="text-sm text-stitch-text-secondary-light font-medium">{t('dashboard.pending')}</div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300 rounded-3xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="material-symbols-outlined text-white text-2xl">star</span>
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-1">4.8</div>
              <div className="text-sm text-stitch-text-secondary-light font-medium">{t('dashboard.averageRating')}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <MainNavigation 
        activeTab="home" 
        onTabChange={(tab) => {
          if (tab === 'home') setCurrentView('home');
          else if (tab === 'messages') setCurrentView('messages');
          else if (tab === 'feed') setCurrentView('feed');
          else if (tab === 'nearby') setCurrentView('nearby');
          else if (tab === 'profile') setCurrentView('profile-settings');
        }}
        unreadMessagesCount={0}
        newMatchesCount={0}
      />
    </div>
  );
};

export default OwnerDashboard; 