import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSubscriptionPlans, getUserSubscription } from '@/lib/payment-services';
import { useToast } from '@/hooks/use-toast';
import { formatPrice, getIntervalText } from '@/lib/stripe';
import type { SubscriptionPlan, UserSubscription } from '@/types';

interface SubscriptionPlansProps {
  onSelectPlan: (plan: SubscriptionPlan) => void;
  currentSubscription?: UserSubscription | null;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ 
  onSelectPlan, 
  currentSubscription 
}) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const subscriptionPlans = await getSubscriptionPlans();
        setPlans(subscriptionPlans);
      } catch (error) {
        console.error('Error loading subscription plans:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los planes de suscripción.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [toast]);

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.planId === planId;
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    if (plan.popular) {
      return <Crown className="w-6 h-6 text-sunny" />;
    }
    return <Star className="w-6 h-6 text-terracotta" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando planes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <Card 
          key={plan.id} 
          className={`relative transition-all duration-200 hover:shadow-lg ${
            plan.popular 
              ? 'border-2 border-terracotta shadow-lg scale-105' 
              : 'border border-border hover:border-terracotta'
          } ${isCurrentPlan(plan.id) ? 'ring-2 ring-green-500' : ''}`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-terracotta text-white px-4 py-1">
                Más Popular
              </Badge>
            </div>
          )}
          
          {isCurrentPlan(plan.id) && (
            <div className="absolute -top-3 right-4">
              <Badge className="bg-green-500 text-white px-3 py-1">
                Plan Actual
              </Badge>
            </div>
          )}

          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {getPlanIcon(plan)}
            </div>
            <CardTitle className="text-xl font-bold text-warm-text">
              {plan.name}
            </CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold text-terracotta">
                {formatPrice(plan.price)}
              </span>
              <span className="text-muted-foreground ml-2">
                / {getIntervalText(plan.interval)}
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => onSelectPlan(plan)}
              className={`w-full ${
                plan.popular 
                  ? 'bg-terracotta hover:bg-terracotta/90' 
                  : 'bg-warm hover:bg-warm/90'
              }`}
              disabled={isCurrentPlan(plan.id)}
            >
              {isCurrentPlan(plan.id) ? 'Plan Actual' : 'Seleccionar Plan'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SubscriptionPlans;
