import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Coffee,
  FileText,
  Info,
  Luggage,
  MapPin,
  Plane,
  TrendingDown,
  Tv,
  Wifi,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { getCountryCodesFromRoute, getCountryFromAirport } from "@/utils/airportCountryMapping";
import {
  getCountryRequirements,
  getTransitRequirements,
  getVisaRequirements,
} from "@/utils/countryRequirements";
import type { Flight } from "@/types/flight";

interface FlightResultsProps {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
  isLoading?: boolean;
  emptyState?: {
    title: string;
    description: string;
  };
}

function formatFlightDate(date: string) {
  const parsedDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return format(parsedDate, "d MMM", { locale: es });
}

function FlightCard({
  flight,
  onSelectFlight,
}: {
  flight: Flight;
  onSelectFlight: (flight: Flight) => void;
}) {
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);
  const countryCodes = getCountryCodesFromRoute(
    flight.route.origin.code,
    flight.route.destination.code,
    flight.schedule.layovers
  );

  const allRequirements = countryCodes
    .map((countryCode) => {
      const requirements = getCountryRequirements(countryCode);
      const isLayover = (flight.schedule.layovers ?? []).some(
        (layover) => getCountryFromAirport(layover.airport.code) === countryCode
      );
      const isDestination = getCountryFromAirport(flight.route.destination.code) === countryCode;

      return {
        countryCode,
        requirements,
        isLayover: isLayover && !isDestination,
        isDestination,
      };
    })
    .filter((item) => item.requirements);

  return (
    <Card className="border-l-4 border-l-primary transition-shadow duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <span className="text-xs font-bold text-white">{flight.airlineCode}</span>
              </div>
              <div>
                <div className="font-semibold">{flight.airline}</div>
                <div className="text-sm text-muted-foreground">{flight.flightNumber}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{flight.aircraft}</div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-2xl font-bold">{flight.schedule.departure.time}</div>
                <div className="text-sm text-muted-foreground">{flight.route.origin.code}</div>
                <div className="text-xs text-muted-foreground">
                  {formatFlightDate(flight.schedule.departure.date)}
                </div>
              </div>

              <div className="mx-4 flex-1">
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="relative h-0.5 flex-1 bg-gray-300">
                    <Plane className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-primary" />
                  </div>
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div className="mt-1 text-center">
                  <div className="text-sm text-muted-foreground">{flight.route.duration.total}</div>
                  {flight.route.stops.length > 0 && (
                    <div className="text-xs text-orange-600">
                      {flight.route.stops.length} escala
                      {flight.route.stops.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold">{flight.schedule.arrival.time}</div>
                <div className="text-sm text-muted-foreground">{flight.route.destination.code}</div>
                <div className="text-xs text-muted-foreground">
                  {formatFlightDate(flight.schedule.arrival.date)}
                </div>
              </div>
            </div>

            {(flight.schedule.layovers ?? []).length > 0 && (
              <div className="space-y-1 text-center text-xs">
                <div className="font-medium text-muted-foreground">
                  {(flight.schedule.layovers ?? []).length === 1 ? "Escala en:" : "Escalas en:"}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {(flight.schedule.layovers ?? []).map((layover, index) => (
                    <div key={`${layover.airport.code}-${index}`} className="flex items-center space-x-1">
                      <div className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                        <MapPin className="mr-1 inline h-3 w-3" />
                        {layover.airport.city}, {layover.airport.country}
                      </div>
                      <span className="text-muted-foreground">({layover.duration})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center space-x-4 text-muted-foreground">
              {flight.services.wifi && <Wifi className="h-4 w-4" />}
              {flight.services.meals.length > 0 && <Coffee className="h-4 w-4" />}
              {flight.services.entertainment && <Tv className="h-4 w-4" />}
              <Luggage className="h-4 w-4" />
              <span className="text-xs">
                {flight.baggage.checked.included
                  ? `${flight.baggage.checked.weight} incluido`
                  : "Equipaje en bodega no incluido"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground line-through">
                Publico: ${flight.pricing.publicPrice.toLocaleString()}
              </div>
              <div className="mb-2 flex items-center justify-end space-x-2">
                <Badge variant="destructive" className="text-xs">
                  -{flight.pricing.discount}% B2B
                </Badge>
              </div>
              <div className="text-3xl font-bold text-primary">
                ${flight.pricing.agencyPrice.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Total: ${flight.pricing.total.toLocaleString()} {flight.pricing.currency}
              </div>
              <div className="text-xs text-muted-foreground">Incluye impuestos y tasas</div>
            </div>

            <div className="text-center">
              <div className="mb-2 text-xs text-muted-foreground">
                {flight.availability.seats} asientos disponibles
              </div>
              <Badge
                variant={flight.availability.seats > 9 ? "default" : "destructive"}
                className="text-xs"
              >
                Clase {flight.availability.bookingClass}
              </Badge>
            </div>

            <Button
              onClick={() => onSelectFlight(flight)}
              className="w-full bg-gradient-primary transition-all duration-300 hover:shadow-glow"
              size="lg"
            >
              Seleccionar vuelo
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              <div className="flex items-center justify-center space-x-2">
                {flight.availability.refundable && (
                  <Badge variant="outline" className="text-xs">
                    Reembolsable
                  </Badge>
                )}
                {flight.availability.changeable && (
                  <Badge variant="outline" className="text-xs">
                    Cambios
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />
        <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground md:grid-cols-3">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>
              {flight.route.origin.city} - {flight.route.destination.city}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Tiempo en vuelo: {flight.route.duration.flying}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Reserva con {flight.restrictions.advancePurchase ?? 0} dias de anticipacion</span>
          </div>
        </div>

        {(flight.schedule.layovers ?? []).length > 0 && (
          <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
            <div className="mb-2 flex items-center space-x-2">
              <Plane className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                Itinerario de conexiones
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {(flight.schedule.layovers ?? []).map((layover, index) => (
                <div key={`${layover.airport.code}-${index}`} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-orange-400" />
                    <span className="font-medium">
                      {layover.airport.city}, {layover.airport.country}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({layover.airport.code})
                    </span>
                  </div>
                  <div className="font-medium text-orange-700">{layover.duration} conexion</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {allRequirements.length > 0 && (
          <Collapsible open={isRequirementsOpen} onOpenChange={setIsRequirementsOpen}>
            <div className="mt-4">
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-blue-50 p-3 transition-colors hover:bg-blue-100"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Requisitos</span>
                    <Badge variant="secondary" className="bg-blue-100 text-xs text-blue-700">
                      {allRequirements.length} pais{allRequirements.length !== 1 ? "es" : ""}
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
                <div className="mt-2 rounded-b-lg rounded-t-none border border-blue-200 border-t-0 bg-blue-50 p-4">
                  <div className="space-y-3">
                    {allRequirements.map((item) => {
                      if (!item.requirements) {
                        return null;
                      }

                      const relevantRequirements = item.isLayover
                        ? getTransitRequirements(item.countryCode) || item.requirements.requirements
                        : getVisaRequirements(item.countryCode) || item.requirements.requirements;

                      return (
                        <div key={item.countryCode} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-blue-800">
                              {item.requirements.country}
                            </span>
                            {item.isLayover && (
                              <Badge variant="outline" className="text-xs">
                                Escala
                              </Badge>
                            )}
                            {item.isDestination && (
                              <Badge variant="outline" className="text-xs">
                                Destino
                              </Badge>
                            )}
                          </div>

                          {relevantRequirements.slice(0, 1).map((requirement) => (
                            <div
                              key={requirement.title}
                              className="flex items-start space-x-2 text-xs"
                            >
                              <div className="mt-0.5 flex items-center space-x-1">
                                {requirement.urgency === "high" && (
                                  <Info className="h-3 w-3 text-red-500" />
                                )}
                                {requirement.urgency === "medium" && (
                                  <Info className="h-3 w-3 text-yellow-500" />
                                )}
                                {requirement.urgency === "low" && (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-800">{requirement.title}</div>
                                <div className="text-gray-600">{requirement.description}</div>
                                {(requirement.additionalInfo ?? []).length > 0 && (
                                  <ul className="mt-1 space-y-0.5">
                                    {(requirement.additionalInfo ?? [])
                                      .slice(0, 2)
                                      .map((infoDetail) => (
                                        <li key={infoDetail} className="text-xs text-gray-500">
                                          {infoDetail}
                                        </li>
                                      ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 rounded bg-blue-100 p-2 text-xs text-blue-600">
                    Consulta con tu agente de viajes para validar requisitos actualizados.
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

export function FlightResults({
  flights,
  onSelectFlight,
  isLoading = false,
  emptyState,
}: FlightResultsProps) {
  const [isDirectOpen, setIsDirectOpen] = useState(true);
  const [isConnectingOpen, setIsConnectingOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-1/4 rounded bg-gray-200" />
                  <div className="h-6 w-1/2 rounded bg-gray-200" />
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                </div>
                <div className="h-10 w-32 rounded bg-gray-200" />
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
          <Plane className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">
            {emptyState?.title || "No se encontraron vuelos"}
          </h3>
          <p className="text-muted-foreground">
            {emptyState?.description || "Intenta modificar tus criterios de busqueda o tus fechas."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const directFlights = flights.filter((flight) => flight.route.stops.length === 0);
  const connectingFlights = flights.filter((flight) => flight.route.stops.length > 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {flights.length} vuelo{flights.length !== 1 ? "s" : ""} encontrado
          {flights.length !== 1 ? "s" : ""}
        </h3>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <TrendingDown className="mr-1 h-3 w-3" />
          Tarifas B2B
        </Badge>
      </div>

      {directFlights.length > 0 && (
        <Collapsible open={isDirectOpen} onOpenChange={setIsDirectOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="h-auto w-full justify-between border-green-200 bg-green-50 p-4 hover:bg-green-100"
            >
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-green-100 p-2">
                  <Plane className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-semibold text-green-800">Vuelos directos</h4>
                  <p className="text-sm text-green-600">
                    {directFlights.length} opcion{directFlights.length !== 1 ? "es" : ""} sin escalas
                  </p>
                </div>
                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
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
            <div className="mt-4 space-y-4 border-l-2 border-green-200 pl-4">
              {directFlights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} onSelectFlight={onSelectFlight} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {connectingFlights.length > 0 && (
        <Collapsible open={isConnectingOpen} onOpenChange={setIsConnectingOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="h-auto w-full justify-between border-orange-200 bg-orange-50 p-4 hover:bg-orange-100"
            >
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-orange-100 p-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-semibold text-orange-800">
                    Vuelos con escalas
                  </h4>
                  <p className="text-sm text-orange-600">
                    {connectingFlights.length} opcion{connectingFlights.length !== 1 ? "es" : ""} con conexiones
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-orange-200 bg-orange-50 text-orange-700"
                >
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
            <div className="mt-4 space-y-4 border-l-2 border-orange-200 pl-4">
              {connectingFlights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} onSelectFlight={onSelectFlight} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {directFlights.length === 0 && connectingFlights.length > 0 && (
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              No se encontraron vuelos directos para esta ruta.
            </span>
          </div>
          <p className="mt-1 text-xs text-blue-600">
            Las conexiones pueden ampliar horarios disponibles y mejorar el precio final.
          </p>
        </div>
      )}

      {connectingFlights.length === 0 && directFlights.length > 0 && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Solo hay vuelos directos disponibles para esta ruta.
            </span>
          </div>
          <p className="mt-1 text-xs text-green-600">
            Llegaras al destino sin conexiones intermedias.
          </p>
        </div>
      )}
    </div>
  );
}
