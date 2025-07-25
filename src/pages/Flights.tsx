import { useState } from "react";
import { Header } from "@/components/Header";
import { FlightSearch } from "@/components/FlightSearch";
import { FlightResults } from "@/components/FlightResults";
import { FlightRouteOptions } from "@/components/FlightRouteOptions";
import { ChatAssistant } from "@/components/ChatAssistant";
import { Flight, FlightSearchCriteria } from "@/types/flight";
import { mockFlights, searchFlights } from "@/data/mockFlights";
import { getRouteInfo } from "@/utils/flightRoutes";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, TrendingDown, Globe, Users, DollarSign } from "lucide-react";

const Flights = () => {
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedFlights, setSelectedFlights] = useState<Flight[]>([]);
  const [showRouteOptions, setShowRouteOptions] = useState(false);
  const [currentSearchCriteria, setCurrentSearchCriteria] = useState<FlightSearchCriteria | null>(null);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [flightType, setFlightType] = useState<'national' | 'international' | null>(null);
  const { toast } = useToast();

  const handleSearch = async (criteria: FlightSearchCriteria) => {
    setIsLoading(true);
    setHasSearched(true);
    setCurrentSearchCriteria(criteria);
    
    try {
      // Simular delay de búsqueda
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Para vuelos internacionales, verificar si necesitamos mostrar opciones de ruta
      const isInternational = criteria.origin && criteria.destination && 
        criteria.origin !== criteria.destination &&
        (criteria.origin === 'BOG' || criteria.destination === 'BOG'); // Asumiendo Colombia como base

      if (isInternational && !criteria.routeType) {
        const info = getRouteInfo(criteria.origin, criteria.destination);
        setRouteInfo(info);
        setShowRouteOptions(true);
        
        toast({
          title: "Opciones de ruta disponibles",
          description: `Selecciona el tipo de vuelo para ${criteria.origin} → ${criteria.destination}`,
        });
      } else {
        // Búsqueda directa de vuelos
        const results = searchFlights(criteria);
        setSearchResults(results);
        setShowRouteOptions(false);
        
        toast({
          title: "Búsqueda completada",
          description: `Se encontraron ${results.length} vuelo${results.length !== 1 ? 's' : ''} disponible${results.length !== 1 ? 's' : ''}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error en la búsqueda",
        description: "Hubo un problema al buscar vuelos. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRoute = async (routeType: 'direct' | 'connecting') => {
    if (!currentSearchCriteria) return;
    
    setIsLoading(true);
    
    try {
      // Simular delay de búsqueda
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const criteriaWithRoute = { ...currentSearchCriteria, routeType };
      const results = searchFlights(criteriaWithRoute);
      
      // Filtrar resultados según el tipo de ruta seleccionado
      const filteredResults = results.filter(flight => {
        if (routeType === 'direct') {
          return flight.route.stops.length === 0;
        } else {
          return flight.route.stops.length > 0;
        }
      });
      
      setSearchResults(filteredResults);
      setShowRouteOptions(false);
      
      toast({
        title: "Búsqueda completada",
        description: `Se encontraron ${filteredResults.length} vuelo${filteredResults.length !== 1 ? 's' : ''} ${routeType === 'direct' ? 'directo' : 'con escalas'}${filteredResults.length !== 1 ? 's' : ''}.`,
      });
    } catch (error) {
      toast({
        title: "Error en la búsqueda",
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
  };

  const handleSelectFlight = (flight: Flight) => {
    // Por ahora solo mostramos una notificación
    // Posteriormente se integrará con el sistema de cotizaciones
    toast({
      title: "Vuelo seleccionado",
      description: `${flight.flightNumber} de ${flight.airline} agregado a tu cotización.`,
    });
    
    setSelectedFlights(prev => [...prev, flight]);
  };

  const handleFlightTypeChange = (type: 'national' | 'international' | null) => {
    setFlightType(type);
  };

  const totalSavings = searchResults.reduce((sum, flight) => 
    sum + (flight.pricing.publicPrice - flight.pricing.agencyPrice), 0
  );

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemsCount={selectedFlights.length} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary via-primary/90 to-secondary py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Vuelos con Tarifas B2B Exclusivas
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Accede a tarifas negociadas especiales para agencias. Ahorra hasta un 30% en vuelos internacionales.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Globe className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm text-muted-foreground">Destinos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Plane className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">25+</div>
                <div className="text-sm text-muted-foreground">Aerolíneas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingDown className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">30%</div>
                <div className="text-sm text-muted-foreground">Descuento promedio</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-muted-foreground">Soporte B2B</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar - Búsqueda */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <FlightSearch 
                onSearch={handleSearch} 
                isLoading={isLoading}
                onFlightTypeChange={handleFlightTypeChange}
              />
              
              {/* Información adicional */}
              <Card className="mt-6">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                    Ventajas B2B
                  </h3>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Tarifas negociadas exclusivas</li>
                    <li>• Descuentos hasta 30%</li>
                    <li>• Soporte especializado 24/7</li>
                    <li>• Opciones de pago flexibles</li>
                    <li>• Reportes detallados</li>
                  </ul>
                </CardContent>
              </Card>

              {hasSearched && searchResults.length > 0 && (
                <Card className="mt-6">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 text-green-600">
                      Ahorro Total B2B
                    </h3>
                    <div className="text-2xl font-bold text-green-600">
                      ${totalSavings.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      En comparación con tarifas públicas
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Main Content - Resultados */}
          <div className="lg:col-span-2">
            {!hasSearched ? (
              flightType === null ? (
                /* Mostrar chat cuando no hay tipo de vuelo seleccionado */
                <ChatAssistant />
              ) : (
                /* Mostrar card de búsqueda cuando hay tipo seleccionado */
                <Card>
                  <CardContent className="p-12 text-center">
                    <Plane className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Busca vuelos con tarifas B2B</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Completa el formulario de búsqueda para acceder a nuestras tarifas negociadas exclusivas para agencias.
                    </p>
                    <div className="mt-6">
                      <Badge className="bg-green-100 text-green-800">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Hasta 30% de descuento
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            ) : showRouteOptions && routeInfo ? (
              <FlightRouteOptions
                origin={currentSearchCriteria?.origin || ''}
                destination={currentSearchCriteria?.destination || ''}
                routeOptions={routeInfo.options}
                onSelectRoute={handleSelectRoute}
                onBack={handleBackToRouteOptions}
              />
            ) : (
              <FlightResults 
                flights={searchResults}
                onSelectFlight={handleSelectFlight}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flights; 