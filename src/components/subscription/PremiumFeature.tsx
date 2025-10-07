import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock } from 'lucide-react';

interface PremiumFeatureProps {
  children: React.ReactNode;
  featureName: string;
  description?: string;
  className?: string;
}

const PremiumFeature: React.FC<PremiumFeatureProps> = ({ 
  children, 
  featureName, 
  description,
  className = ""
}) => {
  const { hasActiveSubscription, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className={`${className} opacity-50`}>
        {children}
      </div>
    );
  }

  if (hasActiveSubscription) {
    return <>{children}</>;
  }

  return (
    <div className={`${className} relative`}>
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
        <Card className="max-w-sm mx-4">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">
              Función Premium
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4">
              {description || `Esta función está disponible solo para usuarios con suscripción activa.`}
            </p>
            
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/subscription')}
                className="w-full bg-terracotta hover:bg-terracotta/90"
              >
                <Crown className="w-4 h-4 mr-2" />
                Ver Planes
              </Button>
              
              <p className="text-xs text-muted-foreground">
                Desbloquea todas las funciones premium
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PremiumFeature;
