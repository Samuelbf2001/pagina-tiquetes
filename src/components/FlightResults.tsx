import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { 
  Plane, 
  Clock, 
  Users, 
  Wifi, 
  Coffee, 
  Tv, 
  Luggage,
  MapPin,
  Calendar,
  TrendingDown,
  Star,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Flight } from "@/types/flight";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getCountryCodesFromRoute, getCountryFromAirport } from "@/utils/airportCountryMapping";
import { getCountryRequirements, getTransitRequirements, getVisaRequirements } from "@/utils/countryRequirements";

interface FlightResultsProps {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
  isLoading?: boolean;
}

// Componente para cada vuelo individual con su propio estado de collapsible
function FlightCard({ flight, onSelectFlight }: { flight: Flight; onSelectFlight: (flight: Flight) => void }) {
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}`;
    } catch (error) {
      return time;
    }
  };

  const formatDate = (date: string) => {
    try {
      const dateObj = new Date(date);
      return format(dateObj, 'd MMM', { locale: es });
    } catch (error) {
      return date;
    }
  };

  // Calcular requisitos para este vuelo específico
  const countryCodes = getCountryCodesFromRoute(
    flight.route.origin.code,
    flight.route.destination.code,
    flight.schedule.layovers
  );
  
  const allRequirements = countryCodes.map(countryCode => {
    const requirements = getCountryRequirements(countryCode);
    const isLayover = flight.schedule.layovers?.some(
      layover => getCountryFromAirport(layover.airport.code) === countryCode
    );
    const isDestination = getCountryFromAirport(flight.route.destination.code) === countryCode;
    
    return {
      countryCode,
      requirements,
      isLayover: isLayover && !isDestination,
      isDestination
    };
  }).filter(item => item.requirements);

  const hasRequirements = allRequirements.length > 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          
          {/* Información de la aerolínea y vuelo */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{flight.airlineCode}</span>
              </div>
              <div>
                <div className="font-semibold">{flight.airline}</div>
                <div className="text-sm text-muted-foreground">{flight.flightNumber}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{flight.aircraft}</div>
          </div>

          {/* Información del vuelo */}
          <div className="lg:col-span-2 space-y-4">
            {/* Ruta principal */}
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-2xl font-bold">{formatTime(flight.schedule.departure.time)}</div>
                <div className="text-sm text-muted-foreground">{flight.route.origin.code}</div>
                <div className="text-xs text-muted-foreground">{formatDate(flight.schedule.departure.date)}</div>
              </div>
              
              <div className="flex-1 mx-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1 h-0.5 bg-gray-300 relative">
                    <Plane className="h-4 w-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary" />
                  </div>
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <div className="text-center mt-1">
                  <div className="text-sm text-muted-foreground">{flight.route.duration.total}</div>
                  {flight.route.stops.length > 0 && (
                    <div className="text-xs text-orange-600">
                      {flight.route.stops.length} escala{flight.route.stops.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">{formatTime(flight.schedule.arrival.time)}</div>
                <div className="text-sm text-muted-foreground">{flight.route.destination.code}</div>
                <div className="text-xs text-muted-foreground">{formatDate(flight.schedule.arrival.date)}</div>
              </div>
            </div>

            {/* Escalas */}
            {flight.schedule.layovers && flight.schedule.layovers.length > 0 && (
              <div className="text-xs text-center space-y-1">
                <div className="text-muted-foreground font-medium">
                  {flight.schedule.layovers.length === 1 ? 'Escala en:' : 'Escalas en:'}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {flight.schedule.layovers.map((layover, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {layover.airport.city}, {layover.airport.country}
                      </div>
                      <span className="text-muted-foreground text-xs">
                        ({layover.duration})
                      </span>
                      {index < flight.schedule.layovers.length - 1 && (
                        <span className="text-muted-foreground mx-1">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Servicios */}
            <div className="flex items-center justify-center space-x-4 text-muted-foreground">
              {flight.services.wifi && <Wifi className="h-4 w-4" />}
              {flight.services.meals.length > 0 && <Coffee className="h-4 w-4" />}
              {flight.services.entertainment && <Tv className="h-4 w-4" />}
              <Luggage className="h-4 w-4" />
              <span className="text-xs">{flight.baggage.checked.weight} incluido</span>
            </div>
          </div>

          {/* Precios y selección */}
          <div className="space-y-4">
            <div className="text-right">
              {/* Precio público tachado */}
              <div className="text-sm text-muted-foreground line-through">
                Público: ${flight.pricing.publicPrice.toLocaleString()}
              </div>
              
              {/* Descuento B2B */}
              <div className="flex items-center justify-end space-x-2 mb-2">
                <Badge variant="destructive" className="text-xs">
                  -{flight.pricing.discount}% B2B
                </Badge>
              </div>
              
              {/* Precio B2B */}
              <div className="text-3xl font-bold text-primary">
                ${flight.pricing.agencyPrice.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Total: ${flight.pricing.total.toLocaleString()} {flight.pricing.currency}
              </div>
              <div className="text-xs text-muted-foreground">
                + impuestos y tasas
              </div>
            </div>

            {/* Disponibilidad */}
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-2">
                {flight.availability.seats} asientos disponibles
              </div>
              <Badge 
                variant={flight.availability.seats > 9 ? "default" : "destructive"}
                className="text-xs"
              >
                Clase {flight.availability.bookingClass}
              </Badge>
            </div>

            {/* Botón de selección */}
            <Button 
              onClick={() => onSelectFlight(flight)}
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
              size="lg"
            >
              Seleccionar Vuelo
            </Button>

            {/* Políticas */}
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <div className="flex items-center justify-center space-x-2">
                {flight.availability.refundable && (
                  <Badge variant="outline" className="text-xs">Reembolsable</Badge>
                )}
                {flight.availability.changeable && (
                  <Badge variant="outline" className="text-xs">Cambios</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información expandida (opcional) */}
        <Separator className="my-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>{flight.route.origin.city} → {flight.route.destination.city}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Duración de vuelo: {flight.route.duration.flying}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Reserva hasta {flight.restrictions.advancePurchase} días antes</span>
          </div>
        </div>

        {/* Información detallada de escalas */}
        {flight.schedule.layovers && flight.schedule.layovers.length > 0 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Plane className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800 text-sm">
                Itinerario de escalas
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {flight.schedule.layovers.map((layover, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="font-medium">
                      {layover.airport.city}, {layover.airport.country}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      ({layover.airport.code})
                    </span>
                  </div>
                  <div className="text-orange-700 font-medium">
                    {layover.duration} conexión
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-orange-600">
              💡 Tiempo suficiente para conexiones cómodas
            </div>
          </div>
        )}

        {/* Requisitos de documentación - COLLAPSIBLE */}
        {hasRequirements && (
          <Collapsible open={isRequirementsOpen} onOpenChange={setIsRequirementsOpen}>
            <div className="mt-4">
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between p-3 bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800 text-sm">
                      Requisitos
                    </span>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                      {allRequirements.length} país{allRequirements.length !== 1 ? 'es' : ''}
                    </Badge>
                  </div>
                  {isRequirementsOpen ? (
                    <ChevronUp className="h-4 w-4 text-blue-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-blue-600" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg border-t-0 rounded-t-none">
                  <div className="space-y-3">
                    {allRequirements.map((item, index) => {
                      if (!item.requirements) return null;
                      
                      const relevantReqs = item.isLayover 
                        ? getTransitRequirements(item.countryCode) || item.requirements.requirements
                        : getVisaRequirements(item.countryCode) || item.requirements.requirements;

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-medium text-blue-800">
                                {item.requirements.country}
                              </span>
                              {item.isLayover && (
                                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                                  Escala
                                </Badge>
                              )}
                              {item.isDestination && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                  Destino
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {relevantReqs.slice(0, 1).map((req, reqIndex) => (
                              <div key={reqIndex} className="flex items-start space-x-2 text-xs">
                                <div className="flex items-center space-x-1 mt-0.5">
                                  {req.urgency === 'high' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                                  {req.urgency === 'medium' && <Info className="h-3 w-3 text-yellow-500" />}
                                  {req.urgency === 'low' && <CheckCircle className="h-3 w-3 text-green-500" />}
                                  <span className="text-xs">{req.icon}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-800">{req.title}</div>
                                  <div className="text-gray-600">{req.description}</div>
                                  {req.additionalInfo && req.additionalInfo.length > 0 && (
                                    <ul className="mt-1 space-y-0.5">
                                      {req.additionalInfo.slice(0, 2).map((info, infoIndex) => (
                                        <li key={infoIndex} className="text-gray-500 text-xs">
                                          • {info}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-3 text-xs text-blue-600 bg-blue-100 p-2 rounded">
                    ℹ️ Consulta con tu agente de viajes para información actualizada sobre requisitos específicos
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

export function FlightResults({ flights, onSelectFlight, isLoading = false }: FlightResultsProps) {
  // Estados para controlar los collapsibles
  const [isDirectOpen, setIsDirectOpen] = useState(true); // Directos abiertos por defecto
  const [isConnectingOpen, setIsConnectingOpen] = useState(false); // Escalas cerradas por defecto

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron vuelos</h3>
          <p className="text-muted-foreground">
            Intenta modificar tus criterios de búsqueda o fechas
          </p>
        </CardContent>
      </Card>
    );
  }

  // Separar vuelos en directos y con escalas
  const directFlights = flights.filter(flight => flight.route.stops.length === 0);
  const connectingFlights = flights.filter(flight => flight.route.stops.length > 0);

  return (
    <div className="space-y-8">
      {/* Header principal con totales */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {flights.length} vuelo{flights.length !== 1 ? 's' : ''} encontrado{flights.length !== 1 ? 's' : ''}
        </h3>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <TrendingDown className="h-3 w-3 mr-1" />
          Tarifas B2B Exclusivas
        </Badge>
      </div>

      {/* Sección de vuelos directos - COLLAPSIBLE */}
      {directFlights.length > 0 && (
        <Collapsible open={isDirectOpen} onOpenChange={setIsDirectOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between p-4 h-auto bg-green-50 border-green-200 hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Plane className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-semibold text-green-800">
                    Vuelos Directos
                  </h4>
                  <p className="text-sm text-green-600">
                    {directFlights.length} vuelo{directFlights.length !== 1 ? 's' : ''} sin escalas
                  </p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Sin escalas
                </Badge>
              </div>
              {isDirectOpen ? (
                <ChevronUp className="h-5 w-5 text-green-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-green-600" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="mt-4 space-y-4 pl-4 border-l-2 border-green-200">
              {directFlights.map((flight) => (
                <FlightCard 
                  key={flight.id} 
                  flight={flight} 
                  onSelectFlight={onSelectFlight} 
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Sección de vuelos con escalas - COLLAPSIBLE */}
      {connectingFlights.length > 0 && (
        <Collapsible open={isConnectingOpen} onOpenChange={setIsConnectingOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between p-4 h-auto bg-orange-50 border-orange-200 hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-semibold text-orange-800">
                    Vuelos con Escalas
                  </h4>
                  <p className="text-sm text-orange-600">
                    {connectingFlights.length} vuelo{connectingFlights.length !== 1 ? 's' : ''} con conexiones
                  </p>
                </div>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  Con escalas
                </Badge>
              </div>
              {isConnectingOpen ? (
                <ChevronUp className="h-5 w-5 text-orange-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-orange-600" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="mt-4 space-y-4 pl-4 border-l-2 border-orange-200">
              {connectingFlights.map((flight) => (
                <FlightCard 
                  key={flight.id} 
                  flight={flight} 
                  onSelectFlight={onSelectFlight} 
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Mensaje si solo hay un tipo de vuelo */}
      {directFlights.length === 0 && connectingFlights.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">
              No se encontraron vuelos directos para esta ruta
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Los vuelos con escalas pueden ofrecer mejor precio y más flexibilidad de horarios
          </p>
        </div>
      )}
      
      {connectingFlights.length === 0 && directFlights.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800 font-medium">
              Solo vuelos directos disponibles para esta ruta
            </span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            ¡Excelente! Llegarás a tu destino sin paradas intermedias
          </p>
        </div>
      )}
    </div>
  );
} 