import { GraduationCap, Plane, Star } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden py-16">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-10 text-center text-white">
        <div className="animate-fade-in">
          <Badge variant="secondary" className="mb-6 border-white/30 bg-white/20 text-white">
            <Star className="mr-2 h-4 w-4" />
            Plataforma B2B para agencias
          </Badge>

          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
            Conecta estudiantes con
            <span className="block bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              experiencias internacionales
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-white/90 md:text-2xl">
            Accede a tarifas negociadas de vuelos y a un catalogo de programas
            internacionales pensado para agencias educativas.
          </p>

          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/programas">
              <Button
                size="lg"
                className="bg-white px-8 py-3 text-primary transition-all duration-300 hover:bg-white/90 hover:shadow-glow"
              >
                <GraduationCap className="mr-2 h-5 w-5" />
                Ver programas
              </Button>
            </Link>
            <Link to="/flights">
              <Button
                size="lg"
                className="bg-white px-8 py-3 text-primary transition-all duration-300 hover:bg-white/90 hover:shadow-glow"
              >
                <Plane className="mr-2 h-5 w-5" />
                Buscar vuelos
              </Button>
            </Link>
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold">500+</div>
              <div className="text-white/80">Programas disponibles</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold">50+</div>
              <div className="text-white/80">Destinos internacionales</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold">100%</div>
              <div className="text-white/80">Tarifas negociadas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
