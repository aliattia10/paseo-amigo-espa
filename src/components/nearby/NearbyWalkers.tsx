import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { MapPin, Star, Heart, X, Sparkles, DollarSign, CheckCircle, Filter } from 'lucide-react';
import { getNearbyWalkers } from '@/lib/nearby-services';
import { createMatch, checkExistingMatch } from '@/lib/matches-services';
import type { NearbyWalker } from '@/types';

interface NearbyWalkersProps {
  onMatch?: (walkerId: string) => void;
}

const NearbyWalkers: React.FC<NearbyWalkersProps> = ({ onMatch }) => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [walkers, setWalkers] = useState<NearbyWalker[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load walkers from Supabase
  useEffect(() => {
    const loadWalkers = async () => {
      if (!userProfile?.city) {
        setLoading(false);
        return;
      }

      try {
        const nearbyWalkers = await getNearbyWalkers(userProfile.city, userProfile.postalCode);
        
        // Filter out walkers the user has already interacted with
        const filteredWalkers = [];
        for (const walker of nearbyWalkers) {
          if (walker.id !== userProfile.id) { // Don't show yourself
            const existingMatch = await checkExistingMatch(userProfile.id, walker.id);
            if (!existingMatch) {
              filteredWalkers.push(walker);
            }
          }
        }
        
        setWalkers(filteredWalkers);
      } catch (error) {
        console.error('Error loading nearby walkers:', error);
        toast({
          title: t('common.error'),
          description: 'Failed to load nearby walkers',
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadWalkers();
  }, [userProfile?.city, userProfile?.postalCode, userProfile?.id, t, toast]);

  const handleLike = async () => {
    if (currentIndex < walkers.length && userProfile) {
      const walker = walkers[currentIndex];
      
      try {
        const match = await createMatch(userProfile.id, walker.id, 'like');
        
        toast({
          title: match.isMutual ? "🎉 It's a Match!" : "Liked!",
          description: match.isMutual 
            ? `You and ${walker.name} matched! Check your messages.`
            : `You liked ${walker.name}`,
        });
        
        onMatch?.(walker.id);
      } catch (error) {
        console.error('Error creating match:', error);
        toast({
          title: t('common.error'),
          description: 'Failed to create match',
          variant: "destructive",
        });
      } finally {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  const handlePass = async () => {
    if (currentIndex < walkers.length && userProfile) {
      const walker = walkers[currentIndex];
      
      try {
        await createMatch(userProfile.id, walker.id, 'pass');
      } catch (error) {
        console.error('Error creating pass:', error);
      }
      
      setCurrentIndex(currentIndex + 1);
    }
  };

  const currentWalker = walkers[currentIndex];

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

  if (!currentWalker) {
    return (
      <div className="min-h-screen bg-stitch-bg-light p-4 flex items-center justify-center pb-24">
        <Card className="max-w-md border-0 rounded-3xl shadow-xl">
          <CardContent className="p-12 text-center">
            <span className="material-symbols-outlined text-7xl text-stitch-primary mx-auto mb-6 block" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>auto_awesome</span>
            <h3 className="text-2xl font-bold text-stitch-text-primary-light mb-2 font-display">
              No more walkers nearby
            </h3>
            <p className="text-stitch-text-secondary-light mb-6">
              Check back later for new walkers in your area
            </p>
            <Button onClick={() => setCurrentIndex(0)} className="bg-gradient-to-r from-stitch-primary to-stitch-secondary hover:from-stitch-primary/90 hover:to-stitch-secondary/90 text-white rounded-2xl shadow-md">
              Reset
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stitch-bg-light p-4 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header with Filter Chips */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stitch-text-primary-light flex items-center gap-3 font-display">
              <span className="material-symbols-outlined text-stitch-primary text-4xl" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>location_on</span>
              {t('nav.nearby')}
            </h1>
            <p className="text-stitch-text-secondary-light mt-1">
              {walkers.length - currentIndex} walkers in your area
            </p>
          </div>
          <Button variant="outline" size="icon" className="rounded-xl">
            <span className="material-symbols-outlined">tune</span>
          </Button>
        </div>

        {/* Walker Card */}
        <Card className="overflow-hidden shadow-2xl border-0 rounded-3xl">
          {/* Image/Avatar Section */}
          <div className="relative h-80 bg-gradient-to-br from-stitch-primary/30 to-stitch-secondary/30">
            <Avatar className="w-full h-full rounded-none">
              <AvatarImage src={currentWalker.profileImage} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-stitch-primary to-stitch-secondary text-white text-6xl rounded-none">
                {currentWalker.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            {/* Badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              {currentWalker.verified && (
                <Badge className="bg-green-500 text-white border-0 rounded-xl shadow-md">
                  <span className="material-symbols-outlined text-sm mr-1" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>check_circle</span>
                  Verified
                </Badge>
              )}
              <Badge className="bg-white/95 text-stitch-text-primary-light border-0 ml-auto rounded-xl shadow-md">
                <span className="material-symbols-outlined text-sm mr-1">location_on</span>
                {currentWalker.distanceEstimate}km away
              </Badge>
            </div>
          </div>

          {/* Info Section */}
          <CardContent className="p-6 bg-stitch-card-light">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-stitch-text-primary-light font-display">
                  {currentWalker.name}
                </h2>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-yellow-400 text-xl" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>star</span>
                  <span className="font-bold text-lg">{currentWalker.rating}</span>
                  <span className="text-sm text-stitch-text-secondary-light">
                    ({currentWalker.totalWalks})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-stitch-text-secondary-light">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  {currentWalker.city}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">payments</span>
                  €{currentWalker.hourlyRate}/hr
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-4">
              <p className="text-stitch-text-primary-light line-clamp-3">
                {currentWalker.bio}
              </p>
            </div>

            {/* Filter Chips - Tags */}
            {currentWalker.walkerProfile?.tags && (
              <div className="flex flex-wrap gap-2">
                {currentWalker.walkerProfile.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs rounded-xl border-stitch-border-light">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mt-6">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full w-16 h-16 border-2 border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400 shadow-md transition-all"
            onClick={handlePass}
          >
            <span className="material-symbols-outlined text-4xl">close</span>
          </Button>
          <Button
            size="lg"
            className="rounded-full w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            onClick={handleLike}
          >
            <span className="material-symbols-outlined text-5xl text-white" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>favorite</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NearbyWalkers;

