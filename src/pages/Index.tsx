import DemoApp from "@/components/DemoApp";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-warm-text mb-4">¿Damos un Paseo?</h1>
          <p className="text-xl text-muted-foreground mb-2">
            Demo Interactivo - App de Compañía Canina
          </p>
          <p className="text-lg text-muted-foreground">
            Conectando dueños y compañeros de perros en toda España
          </p>
        </div>
        
        {/* Demo Container */}
        <div className="flex justify-center">
          <DemoApp />
        </div>
        
        {/* Instructions */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            💡 Navega por la demo tocando los botones para ver el flujo completo de la aplicación
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
