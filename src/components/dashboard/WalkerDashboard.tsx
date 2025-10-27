import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { getWalkRequestsByWalker, getWalkerProfile } from '@/lib/supabase-services';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Heart, MapPin, Clock, LogOut, Settings, Star, DollarSign, CheckCircle, MessageCircle, Crown, ArrowLeftRight, User, PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { WalkRequest, WalkerProfile } from '@/types';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

const WalkerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { userProfile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState<WalkRequest[]>([]);
  const [walkerProfile, setWalkerProfile] = useState<WalkerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!userProfile) return;
      
      try {
        const [requestsData, profileData] = await Promise.all([
          getWalkRequestsByWalker(userProfile.id),
          getWalkerProfile(userProfile.id)
        ]);
        
        setPendingRequests(requestsData.filter(r => r.status === 'pending'));
        setWalkerProfile(profileData);
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

    loadData();
  }, [userProfile, toast, t]);

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

  const handleAcceptRequest = async (requestId: string) => {
    // TODO: Implement accept request functionality
    toast({
      title: t('dashboard.requestAccepted'),
      description: t('dashboard.acceptedWalkRequest'),
    });
  };

  const handleDeclineRequest = async (requestId: string) => {
    // TODO: Implement decline request functionality
    toast({
      title: t('dashboard.requestDeclined'),
      description: t('dashboard.declinedWalkRequest'),
    });
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

  return (
    <div className="min-h-screen bg-stitch-bg-light">
      {/* Enhanced Header with Material Design */}
      <div className="bg-stitch-card-light shadow-md border-b border-stitch-border-light sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-12 h-12 ring-2 ring-stitch-primary shadow-sm rounded-2xl">
                  <AvatarImage src={userProfile?.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"} />
                  <AvatarFallback className="bg-gradient-to-br from-stitch-primary to-stitch-secondary text-white font-semibold rounded-2xl">
                    {userProfile?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-stitch-card-light rounded-full"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold font-display text-stitch-text-primary-light">
                  {t('dashboard.hello')}, {userProfile?.name?.split(' ')[0]}! 🚶‍♂️
                </h1>
                <div className="flex items-center gap-1 text-sm text-stitch-text-secondary-light">
                  <span className="material-symbols-outlined text-stitch-primary text-base">location_on</span>
                  <span>{userProfile?.city}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => navigate('/messages')} title={t('dashboard.messages')} className="relative rounded-xl">
                <span className="material-symbols-outlined">chat_bubble_outline</span>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate('/subscription')} title={t('dashboard.premium')} className="rounded-xl">
                <span className="material-symbols-outlined">workspace_premium</span>
              </Button>
              <Button variant="ghost" size="icon" title={t('dashboard.editProfile')} className="rounded-xl">
                <span className="material-symbols-outlined">settings</span>
              </Button>
              <Button variant="ghost" size="icon" title={t('dashboard.changeRole')} className="rounded-xl">
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

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Profile Stats */}
        {walkerProfile && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300 rounded-3xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-stitch-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <span className="material-symbols-outlined text-white text-2xl">hiking</span>
                </div>
                <div className="text-3xl font-bold text-stitch-primary mb-1">
                  {walkerProfile.totalWalks}
                </div>
                <div className="text-sm text-stitch-text-secondary-light font-medium">{t('dashboard.walksCompleted')}</div>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-lg transition-all duration-300 rounded-3xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>star</span>
                </div>
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {walkerProfile.rating.toFixed(1)}
                </div>
                <div className="text-sm text-stitch-text-secondary-light font-medium">{t('dashboard.rating')}</div>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300 rounded-3xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <span className="material-symbols-outlined text-white text-2xl">payments</span>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  €{walkerProfile.hourlyRate}
                </div>
                <div className="text-sm text-stitch-text-secondary-light font-medium">{t('dashboard.perHour')}</div>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300 rounded-3xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <span className="material-symbols-outlined text-white text-2xl">schedule</span>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {pendingRequests.length}
                </div>
                <div className="text-sm text-stitch-text-secondary-light font-medium">{t('dashboard.pending')}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pending Requests */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-stitch-text-primary-light mb-6 font-display">{t('dashboard.pendingRequests')}</h2>
          {pendingRequests.length === 0 ? (
            <Card className="border-2 border-dashed border-stitch-border-light hover:border-stitch-primary transition-colors rounded-3xl">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-stitch-bg-light rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-5xl text-stitch-text-secondary-light" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>favorite</span>
                </div>
                <h3 className="text-xl font-bold text-stitch-text-primary-light mb-2 font-display">
                  {t('dashboard.noPendingRequests')}
                </h3>
                <p className="text-stitch-text-secondary-light">
                  {t('dashboard.newRequestsAppear')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 shadow-md hover:shadow-lg transition-all rounded-3xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stitch-primary to-stitch-secondary flex items-center justify-center shadow-md">
                          <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>pets</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-stitch-text-primary-light font-display">
                            {t('dashboard.walkFor')} {request.dogId}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-stitch-text-secondary-light mt-2">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">calendar_today</span>
                              {request.date.toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>{request.time}</span>
                            <span>•</span>
                            <span>{request.duration} min</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-stitch-text-secondary-light mt-1">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">location_on</span>
                              {request.location}
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-green-600">€{request.price}</span>
                          </div>
                          {request.notes && (
                            <p className="text-sm text-stitch-text-secondary-light mt-3 bg-white rounded-2xl p-3">
                              <strong>{t('dashboard.notes')}:</strong> {request.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className="bg-green-100 text-green-800 border-0 rounded-xl">
                          {t('dashboard.new')}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                            className="bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-md"
                          >
                            <span className="material-symbols-outlined text-sm mr-1">check</span>
                            {t('dashboard.accept')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineRequest(request.id)}
                            className="rounded-xl"
                          >
                            <span className="material-symbols-outlined text-sm mr-1">close</span>
                            {t('dashboard.decline')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-stitch-text-primary-light mb-6 font-display">{t('dashboard.recentActivity')}</h2>
          <Card className="border-0 bg-stitch-card-light shadow-md rounded-3xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>check_circle</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-stitch-text-primary-light font-display">{t('dashboard.completedWith')} Max</p>
                    <p className="text-sm text-stitch-text-secondary-light">Hace 2 {t('dashboard.hoursAgo')} • 45 min • €15</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-yellow-400 text-base" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>star</span>
                    <span className="text-sm font-medium">5.0</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-stitch-primary flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-white text-xl">schedule</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-stitch-text-primary-light font-display">{t('dashboard.scheduledWith')} Luna</p>
                    <p className="text-sm text-stitch-text-secondary-light">{t('dashboard.tomorrow')} • 30 min • €10</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            size="lg" 
            className="h-16 text-lg bg-gradient-to-r from-stitch-primary to-stitch-secondary hover:from-stitch-primary/90 hover:to-stitch-secondary/90 text-white rounded-2xl shadow-md font-display"
            onClick={() => {/* Navigate to profile settings */}}
          >
            <span className="material-symbols-outlined mr-3">settings</span>
            {t('dashboard.configureProfile')}
          </Button>
          
          <Button 
            size="lg" 
            className="h-16 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl shadow-md font-display"
            onClick={() => {/* Navigate to availability */}}
          >
            <span className="material-symbols-outlined mr-3">schedule</span>
            {t('dashboard.manageAvailability')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WalkerDashboard; 