import { ArrowRight, Clock, DollarSign, Plane, Route } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FlightRouteOption } from "@/types/flight";

interface FlightRouteOptionsProps {
  origin: string;
  destination: string;
  routeOptions: FlightRouteOption[];
  visaRequirements?: string[];
  onSelectRoute: (routeType: "direct" | "connecting") => void;
  onBack: () => void;
}

export function FlightRouteOptions({
  origin,
  destination,
  routeOptions,
  visaRequirements = [],
  onSelectRoute,
  onBack,
}: FlightRouteOptionsProps) {
  if (routeOptions.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-4">
          <div className="flex items-center">
            <Route className="mr-2 h-6 w-6 text-primary" />
            Opciones de vuelo: {origin} - {destination}
          </div>
          <Button variant="ghost" size="sm" onClick={onBack}>
            Cambiar ruta
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="mb-6 text-center">
          <p className="text-muted-foreground">
            Selecciona el tipo de vuelo que prefieres para esta ruta internacional.
          </p>
        </div>

        {visaRequirements.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="mb-2 font-medium">Antes de continuar</p>
            <ul className="space-y-1">
              {visaRequirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {routeOptions.map((option) => (
            <Card
              key={option.type}
              className="cursor-pointer border transition-all duration-300 hover:border-primary hover:shadow-md"
              onClick={() => onSelectRoute(option.type)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full p-2 ${
                          option.type === "direct" ? "bg-green-100" : "bg-blue-100"
                        }`}
                      >
                        {option.type === "direct" ? (
                          <ArrowRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <Route className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{option.label}</h3>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {option.type === "direct" ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Clock className="mr-1 h-3 w-3" />
                          Mas rapido
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800">
                          <DollarSign className="mr-1 h-3 w-3" />
                          Mas flexible
                        </Badge>
                      )}
                    </div>

                    {option.estimatedPrice && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          Precio estimado: ${option.estimatedPrice.min.toLocaleString()} -
                          ${option.estimatedPrice.max.toLocaleString()} USD
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      {option.type === "direct"
                        ? "Sin escalas, menor tiempo de viaje y menos puntos de friccion."
                        : "Incluye conexiones, mas horarios y normalmente mejor precio final."}
                    </div>
                  </div>

                  <div className="ml-4">
                    <Button
                      size="lg"
                      className={
                        option.type === "direct"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }
                    >
                      Buscar vuelos
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <div className="rounded bg-blue-100 p-1">
              <Plane className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm">
              <p className="mb-1 font-medium text-blue-900">Tarifas B2B exclusivas</p>
              <p className="text-blue-700">
                Los rangos mostrados son referenciales y se refinan segun fecha, visa y tipo de
                ruta seleccionada.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
