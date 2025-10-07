import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Heart, Dog, ArrowRight } from "lucide-react";

const Index = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light">
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-warm-text mb-6">¿Damos un Paseo?</h1>
          <p className="text-xl text-muted-foreground mb-4">
            La plataforma perfecta para el cuidado de tu perro
          </p>
          <p className="text-lg text-muted-foreground mb-6">
            Conectamos dueños de perros con compañeros verificados para dar paseos y cuidar a tu mejor amigo
          </p>
          <div className="bg-warm-bg/50 rounded-lg p-6 max-w-3xl mx-auto mb-8">
            <h2 className="text-2xl font-semibold text-warm-text mb-4">¿Qué hacemos por tu perro?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-terracotta rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-warm-text">Paseos al aire libre</h3>
                  <p className="text-sm text-muted-foreground">
                    Tu perro disfrutará de paseos seguros y divertidos con compañeros verificados
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-mediterranean rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-warm-text">Cuidado en casa</h3>
                  <p className="text-sm text-muted-foreground">
                    Servicios de cuidado tanto dentro como fuera de casa cuando lo necesites
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="terracotta" 
              className="text-lg px-8 py-6"
              onClick={handleGetStarted}
            >
              {currentUser ? 'Ir al Dashboard' : 'Comenzar'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            {!currentUser && (
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
              <Dog className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Para Dueños de Perros</h3>
            <p className="text-muted-foreground">
              Encuentra compañeros verificados y confiables para pasear a tu perro cuando lo necesites.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-mediterranean rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Para Amantes de Perros</h3>
            <p className="text-muted-foreground">
              Gana dinero haciendo lo que más te gusta: pasar tiempo con perros y sus dueños.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">¿Listo para empezar?</h2>
          <p className="text-muted-foreground mb-6">
            Únete a nuestra comunidad de amantes de perros
          </p>
          <Button 
            size="lg" 
            variant="terracotta" 
            className="text-lg px-8 py-6"
            onClick={handleGetStarted}
          >
            {currentUser ? 'Ir al Dashboard' : 'Crear Cuenta Gratis'}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;