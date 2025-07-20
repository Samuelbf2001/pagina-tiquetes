import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Clock, Users, MapPin, Star, GraduationCap, Briefcase, Heart, Globe } from "lucide-react";
import { Program } from "@/types/program";

interface ProgramCardProps {
  program: Program;
  onAddToQuote: (program: Program) => void;
}

const typeIcons = {
  language: GraduationCap,
  university: Globe,
  internship: Briefcase,
  volunteer: Heart,
  professional: Briefcase
};

const typeLabels = {
  language: "Idiomas",
  university: "Universidad",
  internship: "Prácticas",
  volunteer: "Voluntariado",
  professional: "Profesional"
};

export function ProgramCard({ program, onAddToQuote }: ProgramCardProps) {
  const TypeIcon = typeIcons[program.type];
  
  return (
    <Card className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-0 overflow-hidden">
      {/* Image placeholder */}
      <div className="h-48 bg-gradient-hero opacity-80 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white/90 text-primary">
            <TypeIcon className="h-3 w-3 mr-1" />
            {typeLabels[program.type]}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          {program.school && (
            <Badge variant="secondary" className="bg-white/90 text-primary">
              <Star className="h-3 w-3 mr-1 fill-current" />
              {program.school.rating}
            </Badge>
          )}
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold mb-1">{program.name}</h3>
          <div className="flex items-center text-white/90">
            <MapPin className="h-4 w-4 mr-1" />
            {program.destination}, {program.country}
          </div>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            {program.duration} {program.durationUnit === 'weeks' ? 'semanas' : 'meses'} • {program.hoursPerWeek}h/semana
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            {program.availableSpots} plazas
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {program.description}
        </p>

        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-2">Destacados:</div>
            <div className="flex flex-wrap gap-1">
              {program.highlights.slice(0, 3).map((highlight, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {highlight}
                </Badge>
              ))}
            </div>
          </div>

          {program.school && (
            <div className="text-sm">
              <span className="font-medium">Institución:</span> {program.school.name}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-primary">
            ${program.priceUSD.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            {program.priceLocal.toLocaleString()} {program.localCurrency}
          </div>
        </div>
        
        <Button 
          onClick={() => onAddToQuote(program)}
          className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
        >
          Añadir a Cotización
        </Button>
      </CardFooter>
    </Card>
  );
}