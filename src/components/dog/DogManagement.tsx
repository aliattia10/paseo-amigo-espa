import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/contexts/AuthContext';
import { getDogsByOwner, createDog, updateDog, uploadImage } from '@/lib/supabase-services';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Camera, Save, X, Dog as DogIcon } from 'lucide-react';
import type { Dog } from '@/types';

const DogManagement: React.FC = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    breed: '',
    notes: '',
    imageUrl: ''
  });

  useEffect(() => {
    loadDogs();
  }, [userProfile]);

  const loadDogs = async () => {
    if (!userProfile) return;
    
    try {
      setLoading(true);
      const dogsData = await getDogsByOwner(userProfile.id);
      setDogs(dogsData);
    } catch (error) {
      console.error('Error loading dogs:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los perros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      let imageUrl = formData.imageUrl;

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, userProfile.id, 'dogs');
      }

      if (editingDog) {
        await updateDog(editingDog.id, { ...formData, imageUrl });
        toast({
          title: "Perro actualizado",
          description: "Los datos del perro se han actualizado correctamente.",
        });
      } else {
        await createDog({
          ...formData,
          ownerId: userProfile.id,
          imageUrl,
        });
        toast({
          title: "Perro añadido",
          description: "El perro se ha añadido a tu perfil correctamente.",
        });
      }

      setShowForm(false);
      setEditingDog(null);
      setImageFile(null);
      setImagePreview(null);
      setFormData({ name: '', age: '', breed: '', notes: '', imageUrl: '' });
      loadDogs();
    } catch (error) {
      console.error('Error saving dog:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el perro. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (dog: Dog) => {
    setEditingDog(dog);
    setFormData({
      name: dog.name,
      age: dog.age,
      breed: dog.breed || '',
      notes: dog.notes,
      imageUrl: dog.imageUrl || ''
    });
    setImagePreview(dog.imageUrl || null);
    setImageFile(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDog(null);
    setImageFile(null);
    setImagePreview(null);
    setFormData({ name: '', age: '', breed: '', notes: '', imageUrl: '' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando perros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-text">Mis Mascotas</h1>
            <p className="text-muted-foreground">
              Gestiona los perfiles de tus mascotas
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-terracotta hover:bg-terracotta/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir Mascota
          </Button>
        </div>

        {/* Dog Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingDog ? 'Editar Mascota' : 'Añadir Nueva Mascota'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nombre de la mascota"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Edad *</Label>
                    <Input
                      id="age"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="Ej: 2 años, 6 meses"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="breed">Raza</Label>
                  <Input
                    id="breed"
                    value={formData.breed}
                    onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                    placeholder="Ej: Labrador, Golden Retriever"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notas especiales *</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Información importante sobre el perro: temperamento, necesidades especiales, etc."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="image">Foto del perro</Label>
                  <div className="space-y-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                    {imagePreview && (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-terracotta hover:bg-terracotta/90">
                    <Save className="w-4 h-4 mr-2" />
                    {editingDog ? 'Actualizar' : 'Añadir Mascota'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Dogs List */}
        {dogs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
                <DogIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No tienes mascotas registradas</h3>
              <p className="text-muted-foreground mb-4">
                Añade tu primera mascota para empezar a buscar cuidadores.
              </p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-terracotta hover:bg-terracotta/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir mi primera mascota
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dogs.map((dog) => (
              <Card key={dog.id} className="overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-500 relative">
                  {dog.imageUrl ? (
                    <img 
                      src={dog.imageUrl} 
                      alt={dog.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Avatar className="w-24 h-24">
                        <AvatarFallback className="text-2xl bg-white/20 text-white">
                          {dog.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{dog.name}</h3>
                      {dog.petType && (
                        <span className="text-xl">
                          {dog.petType === 'cat' ? '🐱' : '🐕'}
                        </span>
                      )}
                    </div>
                    <Badge variant="secondary">Activo</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground mb-3">
                    <p><strong>Edad:</strong> {dog.age}</p>
                    {dog.breed && <p><strong>Raza:</strong> {dog.breed}</p>}
                  </div>
                  <p className="text-sm mb-4 line-clamp-2">{dog.notes}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(dog)}
                    className="w-full"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DogManagement;
