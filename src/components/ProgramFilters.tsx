import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { X, Filter } from "lucide-react";
import { useState } from "react";
import { Program } from "@/types/program";

interface FilterState {
  type: string;
  destination: string;
  priceRange: [number, number];
  duration: string;
  level: string;
  visaRequired: string;
}

interface ProgramFiltersProps {
  programs: Program[];
  onFiltersChange: (filteredPrograms: Program[]) => void;
}

export function ProgramFilters({ programs, onFiltersChange }: ProgramFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    type: "all",
    destination: "all",
    priceRange: [0, 10000],
    duration: "all",
    level: "all",
    visaRequired: "all"
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const destinations = [...new Set(programs.map(p => p.country))];
  const programTypes = [...new Set(programs.map(p => p.type))];

  const typeLabels = {
    language: "Idiomas",
    university: "Universidad", 
    internship: "Prácticas",
    volunteer: "Voluntariado",
    professional: "Profesional"
  };

  const applyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    
    let filtered = programs.filter(program => {
      if (newFilters.type !== "all" && program.type !== newFilters.type) return false;
      if (newFilters.destination !== "all" && program.country !== newFilters.destination) return false;
      if (program.priceUSD < newFilters.priceRange[0] || program.priceUSD > newFilters.priceRange[1]) return false;
      if (newFilters.duration !== "all") {
        const durationWeeks = program.durationUnit === 'weeks' ? program.duration : program.duration * 4;
        if (newFilters.duration === "short" && durationWeeks > 8) return false;
        if (newFilters.duration === "medium" && (durationWeeks <= 8 || durationWeeks > 16)) return false;
        if (newFilters.duration === "long" && durationWeeks <= 16) return false;
      }
      if (newFilters.level !== "all" && program.level !== "all" && program.level !== newFilters.level) return false;
      if (newFilters.visaRequired !== "all") {
        const requiresVisa = newFilters.visaRequired === "required";
        if (program.visaRequired !== requiresVisa) return false;
      }
      
      return true;
    });

    onFiltersChange(filtered);
  };

  const clearFilters = () => {
    const clearedFilters = {
      type: "all",
      destination: "all", 
      priceRange: [0, 10000] as [number, number],
      duration: "all",
      level: "all",
      visaRequired: "all"
    };
    applyFilters(clearedFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== "all" && !(Array.isArray(value) && value[0] === 0 && value[1] === 10000)
  ).length;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Ocultar" : "Mostrar"}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tipo de Programa */}
            <div>
              <Label className="text-sm font-medium">Tipo de Programa</Label>
              <Select 
                value={filters.type} 
                onValueChange={(value) => applyFilters({...filters, type: value})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {programTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {typeLabels[type as keyof typeof typeLabels]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Destino */}
            <div>
              <Label className="text-sm font-medium">Destino</Label>
              <Select 
                value={filters.destination} 
                onValueChange={(value) => applyFilters({...filters, destination: value})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los destinos</SelectItem>
                  {destinations.map(dest => (
                    <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duración */}
            <div>
              <Label className="text-sm font-medium">Duración</Label>
              <Select 
                value={filters.duration} 
                onValueChange={(value) => applyFilters({...filters, duration: value})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier duración</SelectItem>
                  <SelectItem value="short">Corta (1-8 semanas)</SelectItem>
                  <SelectItem value="medium">Media (9-16 semanas)</SelectItem>
                  <SelectItem value="long">Larga (17+ semanas)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nivel */}
            <div>
              <Label className="text-sm font-medium">Nivel Requerido</Label>
              <Select 
                value={filters.level} 
                onValueChange={(value) => applyFilters({...filters, level: value})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier nivel</SelectItem>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Visa */}
            <div>
              <Label className="text-sm font-medium">Visa Requerida</Label>
              <Select 
                value={filters.visaRequired} 
                onValueChange={(value) => applyFilters({...filters, visaRequired: value})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">No importa</SelectItem>
                  <SelectItem value="required">Visa requerida</SelectItem>
                  <SelectItem value="not-required">Sin visa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rango de Precio */}
            <div>
              <Label className="text-sm font-medium">
                Precio USD: ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </Label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => applyFilters({...filters, priceRange: value as [number, number]})}
                max={10000}
                min={0}
                step={100}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}