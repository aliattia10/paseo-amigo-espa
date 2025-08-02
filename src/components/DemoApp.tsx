import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Clock, CheckCircle, Camera, ArrowLeft, Send, User, Dog } from 'lucide-react';
import appLogo from '@/assets/app-logo.png';
import lucasDog from '@/assets/lucas-dog.jpg';
import luciaProfile from '@/assets/lucia-profile.jpg';
import manuelProfile from '@/assets/manuel-profile.jpg';

type Screen = 
  | 'welcome'
  | 'owner-signup'
  | 'dog-profile'
  | 'owner-home'
  | 'companions'
  | 'lucia-profile'
  | 'request'
  | 'chat'
  | 'walker-home'
  | 'accept-request'
  | 'walk-progress'
  | 'walk-complete';

interface DemoAppProps {}

const DemoApp: React.FC<DemoAppProps> = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [userType, setUserType] = useState<'owner' | 'walker' | null>(null);

  const navigateTo = (screen: Screen, type?: 'owner' | 'walker') => {
    if (type) setUserType(type);
    setCurrentScreen(screen);
  };

  const renderHeader = (title: string, showBack: boolean = true) => (
    <div className="flex items-center gap-3 p-4 bg-warm-bg border-b border-border">
      {showBack && (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => {
            if (currentScreen === 'owner-signup') navigateTo('welcome');
            else if (currentScreen === 'dog-profile') navigateTo('owner-signup');
            else if (currentScreen === 'owner-home') navigateTo('dog-profile');
            else if (currentScreen === 'companions') navigateTo('owner-home');
            else if (currentScreen === 'lucia-profile') navigateTo('companions');
            else if (currentScreen === 'request') navigateTo('lucia-profile');
            else if (currentScreen === 'chat') navigateTo('request');
            else navigateTo('welcome');
          }}
        >
          <ArrowLeft />
        </Button>
      )}
      <img src={appLogo} alt="Logo" className="w-8 h-8" />
      <h1 className="text-lg font-semibold text-warm-text">{title}</h1>
    </div>
  );

  // Screen 1: Welcome Screen
  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-sunny-light to-warm-bg flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-12">
          <img src={appLogo} alt="¿Damos un Paseo?" className="w-24 h-24 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-warm-text mb-2">¿Damos un Paseo?</h1>
          <p className="text-lg text-muted-foreground">Conectando dueños y compañeros en toda España</p>
        </div>
        
        <div className="w-full max-w-sm space-y-4">
          <Button 
            variant="terracotta" 
            size="xl" 
            className="w-full"
            onClick={() => navigateTo('owner-signup', 'owner')}
          >
            <Dog className="mr-2" />
            Soy Dueño de un Perro
          </Button>
          
          <Button 
            variant="warm" 
            size="xl" 
            className="w-full"
            onClick={() => navigateTo('walker-home', 'walker')}
          >
            <Heart className="mr-2" />
            Quiero Dar Paseos
          </Button>
        </div>
      </div>
    </div>
  );

  // Screen 2: Owner Signup
  const OwnerSignupScreen = () => (
    <div className="min-h-screen bg-warm-bg">
      {renderHeader('Registro de Dueño')}
      <div className="p-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-center">Crea tu cuenta</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" placeholder="Tu nombre" defaultValue="Manuel" className="text-lg h-12" />
            </div>
            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" placeholder="Tu ciudad" defaultValue="Madrid" className="text-lg h-12" />
            </div>
            <div>
              <Label htmlFor="postal">Código Postal</Label>
              <Input id="postal" placeholder="28010" defaultValue="28010" className="text-lg h-12" />
            </div>
            <div>
              <Label htmlFor="phone">Número de Teléfono</Label>
              <Input id="phone" placeholder="600 123 456" defaultValue="600 123 456" className="text-lg h-12" />
            </div>
            <Button 
              variant="terracotta" 
              size="lg" 
              className="w-full mt-6"
              onClick={() => navigateTo('dog-profile')}
            >
              Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Screen 3: Dog Profile
  const DogProfileScreen = () => (
    <div className="min-h-screen bg-warm-bg">
      {renderHeader('Perfil de tu Perro')}
      <div className="p-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-center">Cuéntanos sobre tu perro</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-terracotta">
                <img src={lucasDog} alt="Lucas" className="w-full h-full object-cover" />
              </div>
              <Button variant="outline" size="sm" className="mt-2">
                <Camera className="mr-2 w-4 h-4" />
                Añadir Foto de tu Perro
              </Button>
            </div>
            
            <div>
              <Label htmlFor="dogName">Nombre de tu Perro</Label>
              <Input id="dogName" placeholder="Nombre del perro" defaultValue="Lucas" className="text-lg h-12" />
            </div>
            
            <div>
              <Label htmlFor="dogAge">Edad</Label>
              <Input id="dogAge" placeholder="Edad en años" defaultValue="12 años" className="text-lg h-12" />
            </div>
            
            <div>
              <Label htmlFor="dogNotes">Cosas que debo saber sobre Lucas</Label>
              <Textarea 
                id="dogNotes" 
                placeholder="Información importante sobre tu perro"
                defaultValue="Lucas es muy bueno. Le asustan un poco las motos. Le encanta oler todo."
                className="min-h-20 text-base"
              />
            </div>
            
            <Button 
              variant="terracotta" 
              size="lg" 
              className="w-full mt-6"
              onClick={() => navigateTo('owner-home')}
            >
              Crear Perfil
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Screen 4: Owner Home
  const OwnerHomeScreen = () => (
    <div className="min-h-screen bg-warm-bg">
      <div className="p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-warm-text mb-2">Hola Manuel,</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>Chamberí, Madrid</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-terracotta mb-4">
            <img src={lucasDog} alt="Lucas" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-semibold">Lucas</h2>
          <p className="text-muted-foreground">12 años • Bodeguero Andaluz</p>
        </div>
        
        <Button 
          variant="terracotta" 
          size="xl" 
          className="w-full mb-4"
          onClick={() => navigateTo('companions')}
        >
          <Heart className="mr-2" />
          Encontrar un Compañero para Lucas
        </Button>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Paseos Recientes</h3>
            <p className="text-muted-foreground text-sm">No hay paseos aún. ¡Encuentra un compañero para Lucas!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Screen 5: Nearby Companions
  const CompanionsScreen = () => (
    <div className="min-h-screen bg-warm-bg">
      {renderHeader('Compañeros Cercanos')}
      <div className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Compañeros verificados en Chamberí</h2>
          <p className="text-muted-foreground">Estos compañeros están cerca de ti</p>
        </div>
        
        <div className="space-y-3">
          <Card 
            className="cursor-pointer transition-shadow hover:shadow-md border-2 border-transparent hover:border-terracotta"
            onClick={() => navigateTo('lucia-profile')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img src={luciaProfile} alt="Lucía" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Lucía</h3>
                  <p className="text-sm text-muted-foreground">Malasaña • 0.8 km</p>
                  <Badge variant="secondary" className="mt-1">Verificada</Badge>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Disponible</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-75">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-mediterranean"></div>
                <div className="flex-1">
                  <h3 className="font-semibold">Carlos</h3>
                  <p className="text-sm text-muted-foreground">Chamberí • 0.5 km</p>
                  <Badge variant="secondary" className="mt-1">Verificado</Badge>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>No disponible</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-75">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-sunny"></div>
                <div className="flex-1">
                  <h3 className="font-semibold">María</h3>
                  <p className="text-sm text-muted-foreground">Chamberí • 1.2 km</p>
                  <Badge variant="secondary" className="mt-1">Verificada</Badge>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Ocupada</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  // Screen 6: Lucia's Profile
  const LuciaProfileScreen = () => (
    <div className="min-h-screen bg-warm-bg">
      {renderHeader('Perfil de Compañero')}
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-terracotta mx-auto mb-4">
                <img src={luciaProfile} alt="Lucía" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl font-bold">Lucía</h2>
              <p className="text-muted-foreground">Estudiante en Madrid</p>
              <div className="flex justify-center mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verificada por la Comunidad
                </Badge>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Sobre Lucía</h3>
                <p className="text-muted-foreground">
                  ¡Hola! Soy Lucía. Me encantan los perros y estaría feliz de pasear con Lucas. 
                  Soy estudiante universitaria y tengo experiencia cuidando mascotas.
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Malasaña • 0.8 km</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Disponible hoy</span>
                </div>
              </div>
            </div>
            
            <Button 
              variant="terracotta" 
              size="lg" 
              className="w-full"
              onClick={() => navigateTo('request')}
            >
              Contactar con Lucía
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Screen 7: Request Screen
  const RequestScreen = () => (
    <div className="min-h-screen bg-warm-bg">
      {renderHeader('Solicitar Servicio')}
      <div className="p-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-center">¿Qué necesitas para Lucas?</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="terracotta" 
              size="xl" 
              className="w-full"
              onClick={() => navigateTo('chat')}
            >
              <Dog className="mr-2" />
              Solicitar un Paseo
            </Button>
            
            <Button 
              variant="warm" 
              size="xl" 
              className="w-full"
            >
              <Heart className="mr-2" />
              Solicitar Compañía en Casa
            </Button>
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              <p>Lucía recibirá tu solicitud y podrá responder directamente</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Screen 8: Chat Screen
  const ChatScreen = () => (
    <div className="min-h-screen bg-warm-bg flex flex-col">
      {renderHeader('Chat con Lucía')}
      
      <div className="flex-1 p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img src={manuelProfile} alt="Manuel" className="w-full h-full object-cover" />
          </div>
          <div className="bg-white rounded-lg p-3 max-w-xs">
            <p className="text-sm">Hola Lucía, ¿te vendría bien dar un paseo a Lucas esta tarde?</p>
            <span className="text-xs text-muted-foreground">14:30</span>
          </div>
        </div>
        
        <div className="flex items-start gap-3 justify-end">
          <div className="bg-terracotta text-white rounded-lg p-3 max-w-xs">
            <p className="text-sm">¡Hola Manuel! Por supuesto, estaría encantada de pasear con Lucas. ¿A qué hora te viene bien?</p>
            <span className="text-xs opacity-75">14:32</span>
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img src={luciaProfile} alt="Lucía" className="w-full h-full object-cover" />
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img src={manuelProfile} alt="Manuel" className="w-full h-full object-cover" />
          </div>
          <div className="bg-white rounded-lg p-3 max-w-xs">
            <p className="text-sm">Perfecto. ¿Te parece bien a las 16:00? Lucas estará muy contento.</p>
            <span className="text-xs text-muted-foreground">14:33</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input placeholder="Escribe un mensaje..." className="flex-1" />
          <Button variant="terracotta" size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Screen 9: Walker Home (Lucia's view)
  const WalkerHomeScreen = () => (
    <div className="min-h-screen bg-warm-bg">
      <div className="p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-warm-text mb-2">Hola Lucía,</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>Malasaña, Madrid</span>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Solicitudes Pendientes</h2>
          
          <Card 
            className="cursor-pointer transition-shadow hover:shadow-md border-2 border-terracotta"
            onClick={() => navigateTo('accept-request')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img src={lucasDog} alt="Lucas" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Paseo para Lucas</h3>
                  <p className="text-sm text-muted-foreground">Manuel • Chamberí • 16:00</p>
                  <p className="text-xs text-muted-foreground mt-1">Hace 5 minutos</p>
                </div>
                <Badge variant="secondary" className="bg-sunny text-warm-text">Nueva</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Tus Estadísticas</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-terracotta">8</div>
                <div className="text-sm text-muted-foreground">Paseos Completados</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-mediterranean">4.9</div>
                <div className="text-sm text-muted-foreground">Valoración</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Screen 10: Accept Request
  const AcceptRequestScreen = () => (
    <div className="min-h-screen bg-warm-bg">
      {renderHeader('Solicitud de Paseo')}
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-terracotta mx-auto mb-4">
                <img src={lucasDog} alt="Lucas" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-xl font-bold">Lucas</h2>
              <p className="text-muted-foreground">12 años • Bodeguero Andaluz</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Detalles del Paseo</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dueño:</span>
                    <span>Manuel</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hora:</span>
                    <span>16:00 - 16:45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ubicación:</span>
                    <span>Chamberí</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Notas sobre Lucas</h3>
                <p className="text-sm text-muted-foreground">
                  Lucas es muy bueno. Le asustan un poco las motos. Le encanta oler todo.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                variant="terracotta" 
                size="lg" 
                className="w-full"
                onClick={() => navigateTo('walk-progress')}
              >
                <CheckCircle className="mr-2" />
                Aceptar Paseo
              </Button>
              <Button variant="outline" size="lg" className="w-full">
                Declinar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Screen 11: Walk in Progress
  const WalkProgressScreen = () => (
    <div className="min-h-screen bg-warm-bg">
      <div className="p-6">
        <div className="text-center mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-terracotta mx-auto mb-4">
            <img src={lucasDog} alt="Lucas" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-warm-text mb-2">Lucas está de paseo con Lucía</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Comenzado a las 16:05</span>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Estado del Paseo</h3>
              <Badge variant="secondary" className="bg-green-100 text-green-800">En progreso</Badge>
            </div>
            <div className="h-32 bg-mediterranean-light rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-mediterranean" />
                <p className="text-sm text-muted-foreground">Ruta en vivo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          variant="terracotta" 
          size="lg" 
          className="w-full"
          onClick={() => navigateTo('walk-complete')}
        >
          Finalizar Paseo
        </Button>
      </div>
    </div>
  );

  // Screen 12: Walk Complete
  const WalkCompleteScreen = () => (
    <div className="min-h-screen bg-warm-bg">
      <div className="p-6">
        <div className="text-center mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-terracotta mx-auto mb-4">
            <img src={lucasDog} alt="Lucas" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-warm-text mb-2">¡El paseo ha terminado!</h1>
          <p className="text-muted-foreground">Lucas ha disfrutado de un paseo de 45 minutos</p>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold mb-4">¿Cómo ha ido todo?</h2>
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="lg" className="text-2xl p-4">
                  🙂
                </Button>
                <Button variant="outline" size="lg" className="text-2xl p-4">
                  😊
                </Button>
                <Button variant="terracotta" size="lg" className="text-2xl p-4">
                  😄
                </Button>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duración:</span>
                <span>45 minutos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distancia:</span>
                <span>2.1 km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Compañero:</span>
                <span>Lucía</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-3">
          <Button 
            variant="terracotta" 
            size="lg" 
            className="w-full"
            onClick={() => navigateTo('owner-home')}
          >
            Volver al Inicio
          </Button>
          <Button variant="outline" size="lg" className="w-full">
            Programar Otro Paseo
          </Button>
        </div>
      </div>
    </div>
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome': return <WelcomeScreen />;
      case 'owner-signup': return <OwnerSignupScreen />;
      case 'dog-profile': return <DogProfileScreen />;
      case 'owner-home': return <OwnerHomeScreen />;
      case 'companions': return <CompanionsScreen />;
      case 'lucia-profile': return <LuciaProfileScreen />;
      case 'request': return <RequestScreen />;
      case 'chat': return <ChatScreen />;
      case 'walker-home': return <WalkerHomeScreen />;
      case 'accept-request': return <AcceptRequestScreen />;
      case 'walk-progress': return <WalkProgressScreen />;
      case 'walk-complete': return <WalkCompleteScreen />;
      default: return <WelcomeScreen />;
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white shadow-2xl min-h-screen overflow-hidden">
      {renderScreen()}
    </div>
  );
};

export default DemoApp;