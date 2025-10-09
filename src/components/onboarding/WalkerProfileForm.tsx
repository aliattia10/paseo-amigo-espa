import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/contexts/AuthContext';
import { createWalkerProfile } from '@/lib/supabase-services';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const WalkerProfileForm: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    experience: '',
    hourlyRate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      await createWalkerProfile({
        userId: currentUser.id,
        bio: formData.bio,
        experience: formData.experience,
        hourlyRate: parseFloat(formData.hourlyRate),
        availability: [],
        rating: 0,
        totalWalks: 0,
        verified: false,
        tags: [],
      });

      toast({
        title: "¡Perfil creado!",
        description: "Tu perfil de paseador ha sido creado exitosamente.",
      });

      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el perfil de paseador.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-0">
        <CardHeader className="space-y-1 pb-6">
          <div className="text-center mb-4">
            <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
              <span className="text-4xl">🚶</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Configura tu perfil de paseador</CardTitle>
          <p className="text-center text-muted-foreground text-sm">
            Comparte tu experiencia y tarifas
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Biografía *</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Cuéntanos sobre ti..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experiencia *</Label>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="Ej: 5 años cuidando perros"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Tarifa por hora (€) *</Label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder="Ej: 15.00"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creando perfil...' : 'Completar perfil'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalkerProfileForm;
