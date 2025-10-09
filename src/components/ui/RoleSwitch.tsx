import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { switchUserRole } from '@/lib/supabase-services';
import { useToast } from '@/hooks/use-toast';
import { Dog, User, RefreshCw, ArrowLeftRight } from 'lucide-react';

interface RoleSwitchProps {
  onRoleChange?: (newRole: 'owner' | 'walker') => void;
}

const RoleSwitch: React.FC<RoleSwitchProps> = ({ onRoleChange }) => {
  const { userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();

  const handleRoleSwitch = async (newRole: 'owner' | 'walker') => {
    if (!userProfile || userProfile.userType === newRole) return;

    try {
      await switchUserRole(userProfile.id, newRole);
      
      // Refresh user profile to get updated role
      await refreshUserProfile();
      
      toast({
        title: "Rol cambiado",
        description: `Ahora eres ${newRole === 'owner' ? 'Dueño de perros' : 'Paseador'}`,
      });

      if (onRoleChange) {
        onRoleChange(newRole);
      }
    } catch (error) {
      console.error('Error switching role:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el rol. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  if (!userProfile) return null;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Cambiar Rol</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center mb-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Rol actual: {userProfile.userType === 'owner' ? 'Dueño' : 'Paseador'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Owner Role */}
          <Button
            variant={userProfile.userType === 'owner' ? 'default' : 'outline'}
            className={`h-20 flex flex-col items-center justify-center ${
              userProfile.userType === 'owner' 
                ? 'bg-terracotta hover:bg-terracotta/90' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleRoleSwitch('owner')}
            disabled={userProfile.userType === 'owner'}
          >
            <Dog className="h-6 w-6 mb-2" />
            <span className="font-semibold">Dueño de Perros</span>
            <span className="text-xs opacity-75">
              Buscar paseadores para tus perros
            </span>
          </Button>

          {/* Walker Role */}
          <Button
            variant={userProfile.userType === 'walker' ? 'default' : 'outline'}
            className={`h-20 flex flex-col items-center justify-center ${
              userProfile.userType === 'walker' 
                ? 'bg-terracotta hover:bg-terracotta/90' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleRoleSwitch('walker')}
            disabled={userProfile.userType === 'walker'}
          >
            <User className="h-6 w-6 mb-2" />
            <span className="font-semibold">Paseador</span>
            <span className="text-xs opacity-75">
              Ofrecer servicios de paseo
            </span>
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Puedes cambiar tu rol en cualquier momento para acceder a diferentes funcionalidades.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleSwitch;
