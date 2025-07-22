import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Clock, DollarSign, ArrowRight, Route } from "lucide-react";
import { FlightRouteOption } from "@/types/flight";

interface FlightRouteOptionsProps {
  origin: string;
  destination: string;
  routeOptions: FlightRouteOption[];
  onSelectRoute: (routeType: 'direct' | 'connecting') => void;
  onBack: () => void;
}

export function FlightRouteOptions({ 
  origin, 
  destination, 
  routeOptions, 
  onSelectRoute, 
  onBack 
}: FlightRouteOptionsProps) {
  
  if (routeOptions.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Route className="h-6 w-6 mr-2 text-primary" />
            Opciones de Vuelo: {origin} → {destination}
          </div>
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Cambiar ruta
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center mb-6">
          <p className="text-muted-foreground">
            Selecciona el tipo de vuelo que prefieres para esta ruta
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {routeOptions.map((option) => (
            <Card 
              key={option.type}
              className="cursor-pointer hover:shadow-md transition-all duration-300 hover:border-primary"
              onClick={() => onSelectRoute(option.type)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        option.type === 'direct' 
                          ? 'bg-green-100' 
                          : 'bg-blue-100'
                      }`}>
                        {option.type === 'direct' ? (
                          <ArrowRight className={`h-5 w-5 ${
                            option.type === 'direct' ? 'text-green-600' : 'text-blue-600'
                          }`} />
                        ) : (
                          <Route className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{option.label}</h3>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {option.type === 'direct' && (
                        <Badge className="bg-green-100 text-green-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Más rápido
                        </Badge>
                      )}
                      {option.type === 'connecting' && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Económico
                        </Badge>
                      )}
                    </div>

                    {option.estimatedPrice && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          Precios estimados: ${option.estimatedPrice.min.toLocaleString()} - ${option.estimatedPrice.max.toLocaleString()} USD
                        </span>
                      </div>
                    )}

                    {/* Información adicional según el tipo */}
                    <div className="text-xs text-muted-foreground">
                      {option.type === 'direct' ? (
                        <div className="flex items-center space-x-4">
                          <span>• Sin escalas</span>
                          <span>• Tiempo de viaje mínimo</span>
                          <span>• Menos conexiones perdidas</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <span>• 1-2 escalas</span>
                          <span>• Más opciones de horarios</span>
                          <span>• Precios competitivos</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    <Button 
                      size="lg"
                      className={
                        option.type === 'direct' 
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }
                    >
                      Buscar Vuelos
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <div className="p-1 bg-blue-100 rounded">
              <Plane className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Tarifas B2B Exclusivas</p>
              <p className="text-blue-700">
                Los precios mostrados incluyen descuentos especiales para agencias. 
                Las tarifas finales pueden variar según disponibilidad y fechas específicas.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 