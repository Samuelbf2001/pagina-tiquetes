import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Plane, Users, RotateCcw, MapPin, Globe, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FlightSearchCriteria } from "@/types/flight";
import { cn } from "@/lib/utils";

interface FlightSearchProps {
  onSearch: (criteria: FlightSearchCriteria) => void;
  isLoading?: boolean;
  onFlightTypeChange?: (flightType: 'national' | 'international' | null) => void;
}

const internationalAirports = [
  { code: "BOG", name: "Bogotá", country: "Colombia" },
  { code: "LHR", name: "Londres", country: "Reino Unido" },
  { code: "CDG", name: "París", country: "Francia" },
  { code: "BCN", name: "Barcelona", country: "España" },
  { code: "MAD", name: "Madrid", country: "España" },
  { code: "YYZ", name: "Toronto", country: "Canadá" },
  { code: "SJO", name: "San José", country: "Costa Rica" },
  { code: "TXL", name: "Berlín", country: "Alemania" },
  { code: "AMS", name: "Amsterdam", country: "Países Bajos" },
  { code: "MIA", name: "Miami", country: "Estados Unidos" },
  { code: "PEK", name: "Beijing", country: "China" },
  { code: "NRT", name: "Tokio", country: "Japón" },
  { code: "ICN", name: "Seúl", country: "Corea del Sur" },
  { code: "SIN", name: "Singapur", country: "Singapur" },
  { code: "DXB", name: "Dubái", country: "Emiratos Árabes Unidos" }
];

const nationalAirports = [
  { code: "BOG", name: "Bogotá - El Dorado", country: "Colombia" },
  { code: "MDE", name: "Medellín - José María Córdova", country: "Colombia" },
  { code: "CLO", name: "Cali - Alfonso Bonilla Aragón", country: "Colombia" },
  { code: "CTG", name: "Cartagena - Rafael Núñez", country: "Colombia" },
  { code: "BAQ", name: "Barranquilla - Ernesto Cortissoz", country: "Colombia" },
  { code: "BGA", name: "Bucaramanga - Palonegro", country: "Colombia" },
  { code: "PEI", name: "Pereira - Matecaña", country: "Colombia" },
  { code: "SMR", name: "Santa Marta - Simón Bolívar", country: "Colombia" },
  { code: "CUC", name: "Cúcuta - Camilo Daza", country: "Colombia" },
  { code: "VVC", name: "Villavicencio - Vanguardia", country: "Colombia" }
];

export function FlightSearch({ onSearch, isLoading = false, onFlightTypeChange }: FlightSearchProps) {
  // Estado para seleccionar tipo de vuelo
  const [flightType, setFlightType] = useState<'national' | 'international' | null>(null);
  
  const [searchCriteria, setSearchCriteria] = useState<FlightSearchCriteria>({
    origin: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    passengers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    cabinClass: "economy",
    tripType: "round-trip",
    flexibility: "exact"
  });

  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [hasUSVisa, setHasUSVisa] = useState<boolean>(false);

  // Notificar al padre cuando cambie el tipo de vuelo
  useEffect(() => {
    onFlightTypeChange?.(flightType);
  }, [flightType, onFlightTypeChange]);

  // Función para obtener la lista de aeropuertos según el tipo
  const getAirportsList = () => {
    return flightType === 'national' ? nationalAirports : internationalAirports;
  };

  // Función para obtener solo el código del aeropuerto para display
  const getAirportDisplayName = (code: string) => {
    const airports = getAirportsList();
    const airport = airports.find(a => a.code === code);
    return airport ? airport.code : "";
  };

  // Función para reiniciar la selección
  const resetSelection = () => {
    setFlightType(null);
    setSearchCriteria({
      origin: "",
      destination: "",
      departureDate: "",
      returnDate: "",
      passengers: {
        adults: 1,
        children: 0,
        infants: 0
      },
      cabinClass: "economy",
      tripType: "round-trip",
      flexibility: "exact"
    });
    setDepartureDate(undefined);
    setReturnDate(undefined);
    setHasUSVisa(false);
  };

  const handleSearch = () => {
    if (!searchCriteria.origin || !searchCriteria.destination || !departureDate) {
      return;
    }

    const criteria: FlightSearchCriteria = {
      ...searchCriteria,
      departureDate: format(departureDate, "yyyy-MM-dd"),
      returnDate: returnDate ? format(returnDate, "yyyy-MM-dd") : undefined
    };

    // Información adicional para el contexto de búsqueda
    const searchContext = {
      criteria,
      flightType,
      hasUSVisa: flightType === 'international' ? hasUSVisa : null
    };

    onSearch(criteria);
    
    // Log para debugging (opcional)
    console.log('Búsqueda iniciada:', searchContext);
  };

  const swapAirports = () => {
    setSearchCriteria(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
  };

  const totalPassengers = searchCriteria.passengers.adults + searchCriteria.passengers.children + searchCriteria.passengers.infants;

  // Si no se ha seleccionado el tipo de vuelo, mostrar la selección inicial
  if (!flightType) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plane className="h-6 w-6 mr-2 text-primary" />
            Búsqueda de Vuelos - Tarifas B2B
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">¿Qué tipo de vuelo necesitas?</h3>
            <p className="text-muted-foreground mb-6">
              Selecciona el tipo de vuelo para acceder a las mejores tarifas
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Vuelos Nacionales */}
            <Card className="cursor-pointer hover:shadow-md transition-all duration-300 hover:border-primary">
              <CardContent 
                className="p-6 text-center space-y-4"
                onClick={() => setFlightType('national')}
              >
                <div className="flex justify-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">Vuelos Nacionales</h4>
                  <p className="text-sm text-muted-foreground leading-tight">
                    Destinos dentro de Colombia
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                    Desde $150.000 COP
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Vuelos Internacionales */}
            <Card className="cursor-pointer hover:shadow-md transition-all duration-300 hover:border-primary">
              <CardContent 
                className="p-6 text-center space-y-4"
                onClick={() => setFlightType('international')}
              >
                <div className="flex justify-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Globe className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">Vuelos Internacionales</h4>
                  <p className="text-sm text-muted-foreground leading-tight">
                    Destinos alrededor del mundo
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                    Tarifas B2B exclusivas
                  </span>
                </div>
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
            <Plane className="h-6 w-6 mr-2 text-primary" />
            Búsqueda de Vuelos - {flightType === 'national' ? 'Nacionales' : 'Internacionales'}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetSelection}
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Cambiar tipo
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Tipo de viaje */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tipo de viaje</Label>
          <RadioGroup
            value={searchCriteria.tripType}
            onValueChange={(value: any) => setSearchCriteria(prev => ({ ...prev, tripType: value }))}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="round-trip" id="round-trip" />
              <label htmlFor="round-trip" className="text-sm">Ida y vuelta</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="one-way" id="one-way" />
              <label htmlFor="one-way" className="text-sm">Solo ida</label>
            </div>
          </RadioGroup>
        </div>

        {/* Origen y Destino */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label>Origen</Label>
            <Select
              value={searchCriteria.origin}
              onValueChange={(value) => setSearchCriteria(prev => ({ ...prev, origin: value }))}
            >
              <SelectTrigger>
                <div className="flex items-center justify-between w-full">
                  <span>{searchCriteria.origin || "Selecciona origen"}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {getAirportsList().map(airport => (
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
              className="h-10 w-10 p-0 rounded-full"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Destino</Label>
            <Select
              value={searchCriteria.destination}
              onValueChange={(value) => setSearchCriteria(prev => ({ ...prev, destination: value }))}
            >
              <SelectTrigger>
                <div className="flex items-center justify-between w-full">
                  <span>{searchCriteria.destination || "Selecciona destino"}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {getAirportsList().map(airport => (
                  <SelectItem key={airport.code} value={airport.code}>
                    {airport.code} - {airport.name}, {airport.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {departureDate ? format(departureDate, "PPP", { locale: es }) : "Selecciona fecha"}
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

          {searchCriteria.tripType === "round-trip" && (
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
                    {returnDate ? format(returnDate, "PPP", { locale: es }) : "Selecciona fecha"}
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

        {/* Pasajeros y Clase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Pasajeros</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  {totalPassengers} pasajero{totalPassengers !== 1 ? 's' : ''}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Adultos</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchCriteria(prev => ({
                          ...prev,
                          passengers: { ...prev.passengers, adults: Math.max(1, prev.passengers.adults - 1) }
                        }))}
                        disabled={searchCriteria.passengers.adults <= 1}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{searchCriteria.passengers.adults}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchCriteria(prev => ({
                          ...prev,
                          passengers: { ...prev.passengers, adults: prev.passengers.adults + 1 }
                        }))}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Niños (2-11 años)</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchCriteria(prev => ({
                          ...prev,
                          passengers: { ...prev.passengers, children: Math.max(0, prev.passengers.children - 1) }
                        }))}
                        disabled={searchCriteria.passengers.children <= 0}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{searchCriteria.passengers.children}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchCriteria(prev => ({
                          ...prev,
                          passengers: { ...prev.passengers, children: prev.passengers.children + 1 }
                        }))}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Bebés (0-2 años)</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchCriteria(prev => ({
                          ...prev,
                          passengers: { ...prev.passengers, infants: Math.max(0, prev.passengers.infants - 1) }
                        }))}
                        disabled={searchCriteria.passengers.infants <= 0}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{searchCriteria.passengers.infants}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchCriteria(prev => ({
                          ...prev,
                          passengers: { ...prev.passengers, infants: prev.passengers.infants + 1 }
                        }))}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Clase de servicio</Label>
            <Select
              value={searchCriteria.cabinClass}
              onValueChange={(value: any) => setSearchCriteria(prev => ({ ...prev, cabinClass: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Económica</SelectItem>
                <SelectItem value="premium-economy">Premium Economy</SelectItem>
                <SelectItem value="business">Ejecutiva</SelectItem>
                <SelectItem value="first">Primera Clase</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Flexibilidad de fechas */}
        <div className="space-y-2">
          <Label>Flexibilidad de fechas</Label>
          <Select
            value={searchCriteria.flexibility}
            onValueChange={(value: any) => setSearchCriteria(prev => ({ ...prev, flexibility: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exact">Fechas exactas</SelectItem>
              <SelectItem value="plus-minus-1">± 1 día</SelectItem>
              <SelectItem value="plus-minus-3">± 3 días</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Visa Americana - Solo para vuelos internacionales */}
        {flightType === 'international' && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Requisitos</Label>
            <div className="flex items-center space-x-2 p-3 border rounded-lg bg-blue-50/50">
              <Checkbox
                id="us-visa"
                checked={hasUSVisa}
                onCheckedChange={(checked) => setHasUSVisa(checked as boolean)}
              />
              <label
                htmlFor="us-visa"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                ¿Tienes visa americana vigente?
              </label>
            </div>
          </div>
        )}

        {/* Botón de búsqueda */}
        <Button 
          onClick={handleSearch}
          className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
          size="lg"
          disabled={isLoading || !searchCriteria.origin || !searchCriteria.destination || !departureDate}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Buscando vuelos...
            </>
          ) : (
            <>
              <Plane className="h-4 w-4 mr-2" />
              Buscar Vuelos
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 