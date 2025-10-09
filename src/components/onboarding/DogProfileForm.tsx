import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/contexts/AuthContext';
import { createDog } from '@/lib/supabase-services';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const DogProfileForm: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    breed: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      await createDog({
        ownerId: currentUser.id,
        name: formData.name,
        age: formData.age,
        breed: formData.breed,
        notes: formData.notes,
      });

      toast({
        title: "¡Perfil creado!",
        description: "El perfil de tu perro ha sido creado exitosamente.",
      });

      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el perfil del perro.",
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
              <span className="text-4xl">🐕</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Cuéntanos sobre tu perro</CardTitle>
          <p className="text-center text-muted-foreground text-sm">
            Completa el perfil para encontrar el paseador perfecto
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Max"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Edad *</Label>
              <Input
                id="age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Ej: 3 años"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">Raza</Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="Ej: Golden Retriever"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas especiales *</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Comportamiento, alergias, preferencias..."
                rows={4}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creando perfil...' : 'Continuar al feed'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DogProfileForm;
