import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, GraduationCap, Globe2, Star } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="animate-fade-in">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
            <Star className="h-4 w-4 mr-2" />
            Plataforma B2B para Agencias
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Conecta estudiantes con
            <span className="block bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              experiencias internacionales
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Accede a tarifas negociadas de vuelos y el catálogo más completo de programas educativos internacionales
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-glow transition-all duration-300 px-8 py-3"
            >
              <GraduationCap className="h-5 w-5 mr-2" />
              Ver Programas
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary px-8 py-3"
            >
              <Plane className="h-5 w-5 mr-2" />
              Buscar Vuelos
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-white/80">Programas Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-white/80">Destinos Internacionales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-white/80">Tarifas Negociadas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}