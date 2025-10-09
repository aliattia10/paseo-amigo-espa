import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/contexts/AuthContext';
import { updateUser } from '@/lib/supabase-services';
import { useToast } from '@/hooks/use-toast';
import { Save, Camera, Star, Clock, MapPin, Euro, User } from 'lucide-react';

const WalkerProfile: React.FC = () => {
  const { userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    experience: 0,
    hourlyRate: 0,
    availability: [] as string[],
  });
  const [availabilityOptions] = useState([
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        bio: userProfile.bio || '',
        experience: userProfile.experience || 0,
        hourlyRate: userProfile.hourlyRate || 0,
        availability: userProfile.availability || [],
      });
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      setLoading(true);
      await updateUser(userProfile.id, formData);
      
      // Refresh user profile
      await refreshUserProfile();
      
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil de paseador se ha actualizado correctamente.",
      });
    } catch (error) {
      console.error('Error updating walker profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      availability: checked 
        ? [...prev.availability, day]
        : prev.availability.filter(d => d !== day)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, you would upload to Supabase Storage here
    // For now, we'll just create a local URL
    const imageUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, profileImage: imageUrl }));
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-text">Mi Perfil de Paseador</h1>
          <p className="text-muted-foreground">
            Completa tu perfil para que los dueños de perros puedan encontrarte
          </p>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-terracotta">{userProfile.rating || 0}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center">
                <Star className="w-4 h-4 mr-1" />
                Calificación
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-mediterranean">{userProfile.totalWalks || 0}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center">
                <Clock className="w-4 h-4 mr-1" />
                Paseos
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-sunny">{formData.experience}</div>
              <div className="text-sm text-muted-foreground">Años experiencia</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-terracotta">€{formData.hourlyRate}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center">
                <Euro className="w-4 h-4 mr-1" />
                Por hora
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={userProfile.profileImage} />
                  <AvatarFallback className="text-2xl">
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="profile-image">Foto de perfil</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Subir
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Biografía *</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Cuéntanos sobre ti, tu experiencia con perros, y por qué te gusta ser paseador..."
                  rows={4}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.bio.length}/500 caracteres
                </p>
              </div>

              {/* Experience and Rate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience">Años de experiencia *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hourly-rate">Tarifa por hora (€) *</Label>
                  <Input
                    id="hourly-rate"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Availability */}
              <div>
                <Label>Disponibilidad *</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Selecciona los días en los que estás disponible para pasear perros
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availabilityOptions.map((day) => (
                    <label key={day} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.availability.includes(day)}
                        onChange={(e) => handleAvailabilityChange(day, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Ubicación
                </h4>
                <p className="text-sm text-muted-foreground">
                  Tu ubicación actual: <strong>{userProfile.city}</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Los dueños de perros podrán encontrarte basándose en tu proximidad
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-terracotta hover:bg-terracotta/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Perfil
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">💡 Consejos para tu perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• <strong>Biografía atractiva:</strong> Menciona tu experiencia con diferentes razas de perros</p>
            <p>• <strong>Tarifa competitiva:</strong> Investiga los precios en tu área para establecer una tarifa justa</p>
            <p>• <strong>Disponibilidad clara:</strong> Mantén actualizada tu disponibilidad para recibir más solicitudes</p>
            <p>• <strong>Foto profesional:</strong> Una buena foto de perfil aumenta la confianza de los dueños</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalkerProfile;
