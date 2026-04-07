import { useState } from "react";
import {
  DollarSign,
  Globe,
  Plane,
  TrendingDown,
  Users,
} from "lucide-react";

import { ChatAssistant } from "@/components/ChatAssistant";
import { FlightResults } from "@/components/FlightResults";
import { FlightRouteOptions } from "@/components/FlightRouteOptions";
import { FlightSearch } from "@/components/FlightSearch";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { searchFlights } from "@/data/mockFlights";
import type { Flight, FlightSearchCriteria, RouteInfo } from "@/types/flight";
import { getCountryCodeFromAirport } from "@/utils/airportCountryMapping";
import { getRouteInfo } from "@/utils/flightRoutes";

interface EmptyStateConfig {
  title: string;
  description: string;
}

const buildEmptyState = (criteria: FlightSearchCriteria): EmptyStateConfig => {
  if (criteria.hasUsVisa === false && getCountryCodeFromAirport(criteria.destination) === "US") {
    return {
      title: "Visa requerida para Estados Unidos",
      description:
        "No podemos mostrar rutas hacia Estados Unidos sin confirmar una visa americana vigente.",
    };
  }

  if (criteria.hasUsVisa === false) {
    return {
      title: "No encontramos vuelos compatibles",
      description:
        "Prueba otras fechas o habilita la visa americana si aceptas conexiones por Estados Unidos.",
    };
  }

  return {
    title: "No se encontraron vuelos",
    description: "Prueba con otra fecha, otra ruta o una configuracion de viaje diferente.",
  };
};

const isInternationalRoute = (criteria: FlightSearchCriteria) => {
  const originCountryCode = getCountryCodeFromAirport(criteria.origin);
  const destinationCountryCode = getCountryCodeFromAirport(criteria.destination);

  if (!originCountryCode || !destinationCountryCode) {
    return criteria.origin !== criteria.destination;
  }

  return originCountryCode !== destinationCountryCode;
};

const Flights = () => {
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedFlights, setSelectedFlights] = useState<Flight[]>([]);
  const [showRouteOptions, setShowRouteOptions] = useState(false);
  const [currentSearchCriteria, setCurrentSearchCriteria] = useState<FlightSearchCriteria | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [flightType, setFlightType] = useState<"national" | "international" | null>(null);
  const [chatFlights, setChatFlights] = useState<Flight[]>([]);
  const [emptyState, setEmptyState] = useState<EmptyStateConfig | null>(null);
  const { toast } = useToast();

  const performSearch = async (criteria: FlightSearchCriteria) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const results = searchFlights(criteria);
    setSearchResults(results);
    setShowRouteOptions(false);
    setEmptyState(results.length === 0 ? buildEmptyState(criteria) : null);

    toast({
      title: results.length > 0 ? "Busqueda completada" : "Sin resultados disponibles",
      description:
        results.length > 0
          ? `Se encontraron ${results.length} vuelo${results.length !== 1 ? "s" : ""} disponible${results.length !== 1 ? "s" : ""}.`
          : buildEmptyState(criteria).description,
      variant: results.length > 0 ? "default" : "destructive",
    });
  };

  const handleSearch = async (criteria: FlightSearchCriteria) => {
    setIsLoading(true);
    setHasSearched(true);
    setCurrentSearchCriteria(criteria);
    setRouteInfo(null);
    setEmptyState(null);

    try {
      if (criteria.hasUsVisa === false && getCountryCodeFromAirport(criteria.destination) === "US") {
        setSearchResults([]);
        setShowRouteOptions(false);
        setEmptyState(buildEmptyState(criteria));
        toast({
          title: "Visa requerida",
          description: buildEmptyState(criteria).description,
          variant: "destructive",
        });
        return;
      }

      if (isInternationalRoute(criteria) && !criteria.routeType) {
        const nextRouteInfo = getRouteInfo(criteria.origin, criteria.destination);
        setRouteInfo(nextRouteInfo);
        setShowRouteOptions(true);
        setSearchResults([]);

        toast({
          title: "Selecciona el tipo de ruta",
          description: `Puedes elegir entre ${nextRouteInfo.totalOptions} opcion${nextRouteInfo.totalOptions !== 1 ? "es" : ""} para esta busqueda.`,
        });
        return;
      }

      await performSearch(criteria);
    } catch (_error) {
      toast({
        title: "Error en la busqueda",
        description: "Hubo un problema al buscar vuelos. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRoute = async (routeType: "direct" | "connecting") => {
    if (!currentSearchCriteria) {
      return;
    }

    setIsLoading(true);

    try {
      await performSearch({ ...currentSearchCriteria, routeType });
    } catch (_error) {
      toast({
        title: "Error en la busqueda",
        description: "Hubo un problema al buscar vuelos. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRouteOptions = () => {
    setShowRouteOptions(false);
    setSearchResults([]);
    setHasSearched(false);
    setEmptyState(null);
  };

  const handleSelectFlight = (flight: Flight) => {
    if (selectedFlights.some((selectedFlight) => selectedFlight.id === flight.id)) {
      toast({
        title: "Vuelo ya agregado",
        description: `${flight.flightNumber} ya esta dentro de tu seleccion.`,
      });
      return;
    }

    setSelectedFlights((currentFlights) => [...currentFlights, flight]);
    toast({
      title: "Vuelo seleccionado",
      description: `${flight.flightNumber} de ${flight.airline} fue agregado a la cotizacion.`,
    });
  };

  const handleFlightTypeChange = (type: "national" | "international" | null) => {
    setFlightType(type);
  };

  const handleChatFlightsDetected = (flights: Flight[]) => {
    setChatFlights(flights);

    if (flights.length === 0) {
      return;
    }

    toast({
      title: "Vuelos encontrados",
      description: `El asistente encontro ${flights.length} vuelo${flights.length !== 1 ? "s" : ""} para ti.`,
    });
  };

  const totalSavings = searchResults.reduce((sum, flight) => {
    return sum + (flight.pricing.publicPrice - flight.pricing.agencyPrice);
  }, 0);
  const currencies = [...new Set(searchResults.map((flight) => flight.pricing.currency))];
  const savingsCurrency = currencies.length === 1 ? currencies[0] : null;

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemsCount={selectedFlights.length} />

      <section className="bg-gradient-to-r from-primary via-primary/90 to-secondary py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center text-white">
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              Vuelos con tarifas B2B exclusivas
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/90">
              Accede a tarifas negociadas para agencias y muestra opciones mas claras segun
              la ruta, la visa y la disponibilidad real del buscador.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Globe className="mx-auto mb-2 h-8 w-8 text-primary" />
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm text-muted-foreground">Destinos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Plane className="mx-auto mb-2 h-8 w-8 text-primary" />
                <div className="text-2xl font-bold">25+</div>
                <div className="text-sm text-muted-foreground">Aerolineas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingDown className="mx-auto mb-2 h-8 w-8 text-green-600" />
                <div className="text-2xl font-bold">30%</div>
                <div className="text-sm text-muted-foreground">Descuento promedio</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-primary" />
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-muted-foreground">Soporte B2B</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <FlightSearch
                onSearch={handleSearch}
                isLoading={isLoading}
                onFlightTypeChange={handleFlightTypeChange}
              />

              <Card className="mt-6">
                <CardContent className="p-4">
                  <h3 className="mb-3 flex items-center font-semibold">
                    <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                    Ventajas B2B
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Tarifas negociadas exclusivas</li>
                    <li>Descuentos de hasta 30%</li>
                    <li>Soporte especializado 24/7</li>
                    <li>Opciones de pago flexibles</li>
                    <li>Resultados ajustados por visa y tipo de ruta</li>
                  </ul>
                </CardContent>
              </Card>

              {hasSearched && searchResults.length > 0 && savingsCurrency && (
                <Card className="mt-6">
                  <CardContent className="p-4">
                    <h3 className="mb-2 font-semibold text-green-600">Ahorro total estimado</h3>
                    <div className="text-2xl font-bold text-green-600">
                      {savingsCurrency} ${totalSavings.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Comparado con tarifa publica para los resultados mostrados.
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {!hasSearched ? (
              flightType === null ? (
                <ChatAssistant onFlightsDetected={handleChatFlightsDetected} />
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Plane className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                    <h3 className="mb-2 text-xl font-semibold">
                      Busca vuelos con tarifas B2B
                    </h3>
                    <p className="mx-auto max-w-md text-muted-foreground">
                      Completa el formulario para acceder a tarifas negociadas y resultados
                      ajustados al tipo de viaje que seleccionaste.
                    </p>
                    <div className="mt-6">
                      <Badge className="bg-green-100 text-green-800">
                        <TrendingDown className="mr-1 h-3 w-3" />
                        Hasta 30% de descuento
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            ) : showRouteOptions && routeInfo ? (
              <FlightRouteOptions
                origin={currentSearchCriteria?.origin || ""}
                destination={currentSearchCriteria?.destination || ""}
                routeOptions={routeInfo.options}
                visaRequirements={routeInfo.visaRequirements}
                onSelectRoute={handleSelectRoute}
                onBack={handleBackToRouteOptions}
              />
            ) : (
              <FlightResults
                flights={searchResults}
                onSelectFlight={handleSelectFlight}
                isLoading={isLoading}
                emptyState={emptyState || undefined}
              />
            )}

            {chatFlights.length > 0 && (
              <div className="mt-8">
                <div className="mb-6">
                  <h2 className="mb-2 text-xl font-semibold text-gray-800">
                    Vuelos encontrados por el asistente
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Estos resultados usan datos locales de apoyo y fechas futuras.
                  </p>
                </div>
                <FlightResults flights={chatFlights} onSelectFlight={handleSelectFlight} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flights;
