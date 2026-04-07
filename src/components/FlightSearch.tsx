import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarIcon,
  Globe,
  MapPin,
  Plane,
  RotateCcw,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  CabinClass,
  FlightFlexibility,
  FlightSearchCriteria,
  TripType,
} from "@/types/flight";

interface FlightSearchProps {
  onSearch: (criteria: FlightSearchCriteria) => void;
  isLoading?: boolean;
  onFlightTypeChange?: (flightType: "national" | "international" | null) => void;
}

const internationalAirports = [
  { code: "BOG", name: "Bogota", country: "Colombia" },
  { code: "LHR", name: "Londres", country: "Reino Unido" },
  { code: "CDG", name: "Paris", country: "Francia" },
  { code: "BCN", name: "Barcelona", country: "Espana" },
  { code: "MAD", name: "Madrid", country: "Espana" },
  { code: "YYZ", name: "Toronto", country: "Canada" },
  { code: "SJO", name: "San Jose", country: "Costa Rica" },
  { code: "TXL", name: "Berlin", country: "Alemania" },
  { code: "AMS", name: "Amsterdam", country: "Paises Bajos" },
  { code: "MIA", name: "Miami", country: "Estados Unidos" },
  { code: "PEK", name: "Beijing", country: "China" },
  { code: "NRT", name: "Tokio", country: "Japon" },
  { code: "ICN", name: "Seul", country: "Corea del Sur" },
  { code: "SIN", name: "Singapur", country: "Singapur" },
  { code: "DXB", name: "Dubai", country: "Emiratos Arabes Unidos" },
] as const;

const nationalAirports = [
  { code: "BOG", name: "Bogota - El Dorado", country: "Colombia" },
  { code: "MDE", name: "Medellin - Jose Maria Cordova", country: "Colombia" },
  { code: "CLO", name: "Cali - Alfonso Bonilla Aragon", country: "Colombia" },
  { code: "CTG", name: "Cartagena - Rafael Nunez", country: "Colombia" },
  { code: "BAQ", name: "Barranquilla - Ernesto Cortissoz", country: "Colombia" },
  { code: "BGA", name: "Bucaramanga - Palonegro", country: "Colombia" },
  { code: "PEI", name: "Pereira - Matecana", country: "Colombia" },
  { code: "SMR", name: "Santa Marta - Simon Bolivar", country: "Colombia" },
  { code: "CUC", name: "Cucuta - Camilo Daza", country: "Colombia" },
  { code: "VVC", name: "Villavicencio - Vanguardia", country: "Colombia" },
] as const;

const createInitialSearchCriteria = (): FlightSearchCriteria => ({
  origin: "",
  destination: "",
  departureDate: "",
  returnDate: "",
  passengers: {
    adults: 1,
    children: 0,
    infants: 0,
  },
  cabinClass: "economy",
  tripType: "round-trip",
  flexibility: "exact",
  hasUsVisa: false,
});

export function FlightSearch({
  onSearch,
  isLoading = false,
  onFlightTypeChange,
}: FlightSearchProps) {
  const [flightType, setFlightType] = useState<"national" | "international" | null>(null);
  const [searchCriteria, setSearchCriteria] = useState<FlightSearchCriteria>(
    createInitialSearchCriteria()
  );
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();

  useEffect(() => {
    onFlightTypeChange?.(flightType);
  }, [flightType, onFlightTypeChange]);

  useEffect(() => {
    if (searchCriteria.tripType === "one-way") {
      setReturnDate(undefined);
    }
  }, [searchCriteria.tripType]);

  const airports = flightType === "national" ? nationalAirports : internationalAirports;
  const totalPassengers =
    searchCriteria.passengers.adults +
    searchCriteria.passengers.children +
    searchCriteria.passengers.infants;
  const requiresReturnDate = searchCriteria.tripType === "round-trip";
  const hasSameAirport = searchCriteria.origin !== "" && searchCriteria.origin === searchCriteria.destination;
  const isSearchDisabled =
    isLoading ||
    !searchCriteria.origin ||
    !searchCriteria.destination ||
    !departureDate ||
    hasSameAirport ||
    (requiresReturnDate && !returnDate);

  const updateSearchCriteria = (partialCriteria: Partial<FlightSearchCriteria>) => {
    setSearchCriteria((currentCriteria) => ({
      ...currentCriteria,
      ...partialCriteria,
    }));
  };

  const resetSelection = () => {
    setFlightType(null);
    setSearchCriteria(createInitialSearchCriteria());
    setDepartureDate(undefined);
    setReturnDate(undefined);
  };

  const handleSearch = () => {
    if (isSearchDisabled) {
      return;
    }

    onSearch({
      ...searchCriteria,
      departureDate: format(departureDate!, "yyyy-MM-dd"),
      returnDate:
        requiresReturnDate && returnDate ? format(returnDate, "yyyy-MM-dd") : undefined,
      hasUsVisa: flightType === "international" ? Boolean(searchCriteria.hasUsVisa) : undefined,
    });
  };

  const swapAirports = () => {
    updateSearchCriteria({
      origin: searchCriteria.destination,
      destination: searchCriteria.origin,
    });
  };

  if (!flightType) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plane className="mr-2 h-6 w-6 text-primary" />
            Busqueda de vuelos B2B
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold">Que tipo de vuelo necesitas?</h3>
            <p className="text-muted-foreground">
              Elige entre rutas nacionales o internacionales para cargar el formulario adecuado.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Card className="cursor-pointer border transition-all duration-300 hover:border-primary hover:shadow-md">
              <CardContent
                className="space-y-4 p-6 text-center"
                onClick={() => setFlightType("national")}
              >
                <div className="flex justify-center">
                  <div className="rounded-full bg-blue-100 p-3">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Vuelos nacionales</h4>
                  <p className="text-sm text-muted-foreground">Rutas dentro de Colombia</p>
                </div>
                <span className="rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                  Tarifas B2B desde $150.000 COP
                </span>
              </CardContent>
            </Card>

            <Card className="cursor-pointer border transition-all duration-300 hover:border-primary hover:shadow-md">
              <CardContent
                className="space-y-4 p-6 text-center"
                onClick={() => setFlightType("international")}
              >
                <div className="flex justify-center">
                  <div className="rounded-full bg-slate-100 p-3">
                    <Globe className="h-6 w-6 text-slate-700" />
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Vuelos internacionales</h4>
                  <p className="text-sm text-muted-foreground">Destinos para programas y viajes</p>
                </div>
                <span className="rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                  Tarifas negociadas para agencias
                </span>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Plane className="mr-2 h-6 w-6 text-primary" />
            {flightType === "national" ? "Vuelos nacionales" : "Vuelos internacionales"}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetSelection}
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Cambiar tipo
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tipo de viaje</Label>
          <RadioGroup
            value={searchCriteria.tripType}
            onValueChange={(value: TripType) => updateSearchCriteria({ tripType: value })}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="round-trip" id="round-trip" />
              <label htmlFor="round-trip" className="text-sm">
                Ida y vuelta
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="one-way" id="one-way" />
              <label htmlFor="one-way" className="text-sm">
                Solo ida
              </label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Origen</Label>
            <Select
              value={searchCriteria.origin}
              onValueChange={(value) => updateSearchCriteria({ origin: value })}
            >
              <SelectTrigger>
                <span>{searchCriteria.origin || "Selecciona origen"}</span>
              </SelectTrigger>
              <SelectContent>
                {airports.map((airport) => (
                  <SelectItem key={airport.code} value={airport.code}>
                    {airport.code} - {airport.name}, {airport.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={swapAirports}
              className="h-10 w-10 rounded-full p-0"
              disabled={!searchCriteria.origin && !searchCriteria.destination}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Destino</Label>
            <Select
              value={searchCriteria.destination}
              onValueChange={(value) => updateSearchCriteria({ destination: value })}
            >
              <SelectTrigger>
                <span>{searchCriteria.destination || "Selecciona destino"}</span>
              </SelectTrigger>
              <SelectContent>
                {airports.map((airport) => (
                  <SelectItem key={airport.code} value={airport.code}>
                    {airport.code} - {airport.name}, {airport.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasSameAirport && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            El origen y el destino deben ser diferentes para iniciar la busqueda.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Fecha de salida</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !departureDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {departureDate
                    ? format(departureDate, "PPP", { locale: es })
                    : "Selecciona fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={departureDate}
                  onSelect={setDepartureDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {requiresReturnDate && (
            <div className="space-y-2">
              <Label>Fecha de regreso</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !returnDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnDate
                      ? format(returnDate, "PPP", { locale: es })
                      : "Selecciona fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    disabled={(date) => date < (departureDate || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Pasajeros</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  {totalPassengers} pasajero{totalPassengers !== 1 ? "s" : ""}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  {([
                    { key: "adults", label: "Adultos", min: 1 },
                    { key: "children", label: "Ninos (2-11 anos)", min: 0 },
                    { key: "infants", label: "Bebes (0-2 anos)", min: 0 },
                  ] as const).map((passengerType) => (
                    <div
                      key={passengerType.key}
                      className="flex items-center justify-between"
                    >
                      <Label>{passengerType.label}</Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateSearchCriteria({
                              passengers: {
                                ...searchCriteria.passengers,
                                [passengerType.key]: Math.max(
                                  passengerType.min,
                                  searchCriteria.passengers[passengerType.key] - 1
                                ),
                              },
                            })
                          }
                          disabled={
                            searchCriteria.passengers[passengerType.key] <= passengerType.min
                          }
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">
                          {searchCriteria.passengers[passengerType.key]}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateSearchCriteria({
                              passengers: {
                                ...searchCriteria.passengers,
                                [passengerType.key]:
                                  searchCriteria.passengers[passengerType.key] + 1,
                              },
                            })
                          }
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Clase de servicio</Label>
            <Select
              value={searchCriteria.cabinClass}
              onValueChange={(value: CabinClass) => updateSearchCriteria({ cabinClass: value })}
            >
              <SelectTrigger>
                <span>
                  {searchCriteria.cabinClass === "economy"
                    ? "Economica"
                    : searchCriteria.cabinClass === "premium-economy"
                      ? "Premium Economy"
                      : searchCriteria.cabinClass === "business"
                        ? "Ejecutiva"
                        : "Primera clase"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Economica</SelectItem>
                <SelectItem value="premium-economy">Premium Economy</SelectItem>
                <SelectItem value="business">Ejecutiva</SelectItem>
                <SelectItem value="first">Primera clase</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Flexibilidad de fechas</Label>
          <Select
            value={searchCriteria.flexibility}
            onValueChange={(value: FlightFlexibility) => updateSearchCriteria({ flexibility: value })}
          >
            <SelectTrigger>
              <span>
                {searchCriteria.flexibility === "exact"
                  ? "Fechas exactas"
                  : searchCriteria.flexibility === "plus-minus-1"
                    ? "+/- 1 dia"
                    : "+/- 3 dias"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exact">Fechas exactas</SelectItem>
              <SelectItem value="plus-minus-1">+/- 1 dia</SelectItem>
              <SelectItem value="plus-minus-3">+/- 3 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {flightType === "international" && (
          <div className="space-y-3 rounded-lg border bg-blue-50/50 p-4">
            <Label className="text-sm font-medium">Requisitos</Label>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="us-visa"
                checked={Boolean(searchCriteria.hasUsVisa)}
                onCheckedChange={(checked) =>
                  updateSearchCriteria({ hasUsVisa: Boolean(checked) })
                }
              />
              <div>
                <label
                  htmlFor="us-visa"
                  className="cursor-pointer text-sm font-medium leading-none"
                >
                  Tengo visa americana vigente
                </label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Si esta casilla no esta marcada, ocultaremos rutas con ingreso o escala
                  por Estados Unidos.
                </p>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleSearch}
          className="w-full bg-gradient-primary transition-all duration-300 hover:shadow-glow"
          size="lg"
          disabled={isSearchDisabled}
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
              Buscando vuelos...
            </>
          ) : (
            <>
              <Plane className="mr-2 h-4 w-4" />
              Buscar vuelos
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
