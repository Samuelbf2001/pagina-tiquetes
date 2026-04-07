import { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { Program } from "@/types/program";

interface FilterState {
  type: Program["type"] | "all";
  destination: string;
  priceRange: [number, number];
  duration: string;
  level: Program["level"] | "all";
  visaRequired: "all" | "required" | "not-required";
}

interface ProgramFiltersProps {
  programs: Program[];
  onFiltersChange: (filteredPrograms: Program[]) => void;
  onResetReady?: (resetFilters: () => void) => void;
}

const initialFilters: FilterState = {
  type: "all",
  destination: "all",
  priceRange: [0, 10000],
  duration: "all",
  level: "all",
  visaRequired: "all",
};

const internshipDestinations = [
  "Dubai",
  "Qatar",
  "Tailandia",
  "Maldivas",
  "Emiratos Arabes Unidos",
  "Bahrein",
  "Vietnam",
  "Hong Kong",
  "Hawai",
  "Alaska",
  "Estados Unidos",
  "Espana",
];

const asianDestinations = [
  "Qatar",
  "Tailandia",
  "Maldivas",
  "Emiratos Arabes Unidos",
  "Bahrein",
  "Vietnam",
  "Hong Kong",
  "Dubai",
];

const usDestinations = ["Estados Unidos", "Hawai", "Alaska"];
const spainDestinations = ["Espana"];

const typeLabels: Record<Program["type"], string> = {
  language: "Cursos de ingles",
  volunteer: "Voluntariados",
  internship: "Practicas internacionales",
  aupair: "AuPair",
};

const getAvailableDestinations = (programs: Program[], filters: FilterState) => {
  if (filters.type === "all") {
    return [...new Set(programs.map((program) => program.country))];
  }

  if (filters.type === "internship") {
    return internshipDestinations;
  }

  return [...new Set(programs.filter((program) => program.type === filters.type).map((program) => program.country))];
};

const getDurationOptions = (filters: FilterState) => {
  if (filters.type === "internship" && filters.destination !== "all") {
    if (usDestinations.includes(filters.destination)) {
      return [
        { value: "all", label: "Cualquier duracion" },
        { value: "6-12-months", label: "6-12 meses" },
      ];
    }

    if (asianDestinations.includes(filters.destination)) {
      return [
        { value: "all", label: "Cualquier duracion" },
        { value: "6-18-months", label: "6-18 meses" },
      ];
    }

    if (spainDestinations.includes(filters.destination)) {
      return [
        { value: "all", label: "Cualquier duracion" },
        { value: "3-months", label: "3 meses" },
        { value: "6-12-months", label: "6-12 meses" },
      ];
    }
  }

  return [
    { value: "all", label: "Cualquier duracion" },
    { value: "short", label: "Corta (1-8 semanas)" },
    { value: "medium", label: "Media (9-16 semanas)" },
    { value: "long", label: "Larga (17+ semanas)" },
  ];
};

const normalizeFilters = (
  nextFilters: FilterState,
  previousFilters: FilterState,
  programs: Program[]
) => {
  const availableDestinations = getAvailableDestinations(programs, nextFilters);
  const normalizedDestination =
    nextFilters.destination !== "all" && !availableDestinations.includes(nextFilters.destination)
      ? "all"
      : nextFilters.destination;
  const resetDuration =
    nextFilters.type === "internship" && normalizedDestination !== previousFilters.destination
      ? "all"
      : nextFilters.duration;

  return {
    ...nextFilters,
    destination: normalizedDestination,
    duration: resetDuration,
  };
};

const filterPrograms = (programs: Program[], filters: FilterState) =>
  programs.filter((program) => {
    if (filters.type !== "all" && program.type !== filters.type) return false;
    if (filters.destination !== "all" && program.country !== filters.destination) return false;
    if (program.priceUSD < filters.priceRange[0] || program.priceUSD > filters.priceRange[1]) return false;

    if (filters.duration !== "all") {
      const durationWeeks =
        program.durationUnit === "weeks" ? program.duration : program.duration * 4;
      const durationMonths =
        program.durationUnit === "months" ? program.duration : program.duration / 4;

      if (filters.type === "internship") {
        if (filters.duration === "3-months" && durationMonths !== 3) return false;
        if (filters.duration === "6-12-months" && (durationMonths < 6 || durationMonths > 12)) return false;
        if (filters.duration === "6-18-months" && (durationMonths < 6 || durationMonths > 18)) return false;
      } else {
        if (filters.duration === "short" && durationWeeks > 8) return false;
        if (filters.duration === "medium" && (durationWeeks <= 8 || durationWeeks > 16)) return false;
        if (filters.duration === "long" && durationWeeks <= 16) return false;
      }
    }

    if (filters.level !== "all" && program.level !== "all" && program.level !== filters.level) {
      return false;
    }

    if (filters.visaRequired !== "all") {
      const requiresVisa = filters.visaRequired === "required";
      if (program.visaRequired !== requiresVisa) return false;
    }

    return true;
  });

export function ProgramFilters({
  programs,
  onFiltersChange,
  onResetReady,
}: ProgramFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const destinations = useMemo(() => getAvailableDestinations(programs, filters), [filters, programs]);
  const programTypes = useMemo(() => [...new Set(programs.map((program) => program.type))], [programs]);
  const durationOptions = useMemo(() => getDurationOptions(filters), [filters]);
  const filteredPrograms = useMemo(() => filterPrograms(programs, filters), [filters, programs]);

  useEffect(() => {
    onFiltersChange(filteredPrograms);
  }, [filteredPrograms, onFiltersChange]);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  useEffect(() => {
    onResetReady?.(clearFilters);
  }, [clearFilters, onResetReady]);

  const applyFilters = (partialFilters: Partial<FilterState>) => {
    setFilters((currentFilters) =>
      normalizeFilters(
        {
          ...currentFilters,
          ...partialFilters,
        },
        currentFilters,
        programs
      )
    );
  };

  const activeFiltersCount = Object.values(filters).filter((value) => {
    if (Array.isArray(value)) {
      return !(value[0] === 0 && value[1] === 10000);
    }

    return value !== "all";
  }).length;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center text-lg">
              <Filter className="mr-2 h-5 w-5" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {filteredPrograms.length} programa{filteredPrograms.length !== 1 ? "s" : ""} coinciden
              con la seleccion actual.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                Limpiar
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded((isOpen) => !isOpen)}>
              {isExpanded ? "Ocultar" : "Mostrar"}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label className="text-sm font-medium">Tipo de programa</Label>
              <Select value={filters.type} onValueChange={(value: FilterState["type"]) => applyFilters({ type: value })}>
                <SelectTrigger className="mt-1">
                  <span>{filters.type === "all" ? "Todos los tipos" : typeLabels[filters.type]}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {programTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {typeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Destino</Label>
              <Select value={filters.destination} onValueChange={(value) => applyFilters({ destination: value })}>
                <SelectTrigger className="mt-1">
                  <span>{filters.destination === "all" ? "Todos los destinos" : filters.destination}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los destinos</SelectItem>
                  {destinations.map((destination) => (
                    <SelectItem key={destination} value={destination}>
                      {destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Duracion</Label>
              <Select value={filters.duration} onValueChange={(value) => applyFilters({ duration: value })}>
                <SelectTrigger className="mt-1">
                  <span>
                    {durationOptions.find((option) => option.value === filters.duration)?.label ||
                      "Cualquier duracion"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Nivel requerido</Label>
              <Select value={filters.level} onValueChange={(value: FilterState["level"]) => applyFilters({ level: value })}>
                <SelectTrigger className="mt-1">
                  <span>
                    {filters.level === "all"
                      ? "Cualquier nivel"
                      : filters.level === "beginner"
                        ? "Principiante"
                        : filters.level === "intermediate"
                          ? "Intermedio"
                          : "Avanzado"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier nivel</SelectItem>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Visa requerida</Label>
              <Select value={filters.visaRequired} onValueChange={(value: FilterState["visaRequired"]) => applyFilters({ visaRequired: value })}>
                <SelectTrigger className="mt-1">
                  <span>
                    {filters.visaRequired === "all"
                      ? "No importa"
                      : filters.visaRequired === "required"
                        ? "Visa requerida"
                        : "Sin visa"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">No importa</SelectItem>
                  <SelectItem value="required">Visa requerida</SelectItem>
                  <SelectItem value="not-required">Sin visa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">
                Precio USD: ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </Label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => applyFilters({ priceRange: value as [number, number] })}
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
