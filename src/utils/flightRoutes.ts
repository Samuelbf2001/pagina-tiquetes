import type { FlightRouteOption, RouteInfo } from "@/types/flight";

const directRoutes = new Set([
  "BOG-MIA",
  "BOG-MAD",
  "BOG-CDG",
  "BOG-AMS",
  "MIA-BOG",
  "MAD-BOG",
  "CDG-BOG",
  "AMS-BOG",
]);

export const getRouteOptions = (origin: string, destination: string): FlightRouteOption[] => {
  if (!origin || !destination) {
    return [];
  }

  const routeKey = `${origin}-${destination}`;
  const reverseRouteKey = `${destination}-${origin}`;
  const hasDirectFlight = directRoutes.has(routeKey) || directRoutes.has(reverseRouteKey);

  const options: FlightRouteOption[] = [
    {
      type: "connecting",
      label: "Vuelos con escalas",
      description: "Mas opciones de horario y mejor rango de precios",
      available: true,
      estimatedPrice: getEstimatedPrice(origin, destination, "connecting"),
    },
  ];

  if (hasDirectFlight) {
    options.unshift({
      type: "direct",
      label: "Vuelos directos",
      description: "Menor tiempo de viaje y menos cambios de avion",
      available: true,
      estimatedPrice: getEstimatedPrice(origin, destination, "direct"),
    });
  }

  return options;
};

const getEstimatedPrice = (
  origin: string,
  destination: string,
  type: Extract<FlightRouteOption["type"], "direct" | "connecting">
) => {
  const priceMatrix: Record<
    string,
    { direct: { min: number; max: number }; connecting: { min: number; max: number } }
  > = {
    "BOG-LHR": { direct: { min: 1200, max: 1800 }, connecting: { min: 900, max: 1400 } },
    "BOG-CDG": { direct: { min: 1100, max: 1600 }, connecting: { min: 850, max: 1300 } },
    "BOG-MAD": { direct: { min: 1000, max: 1500 }, connecting: { min: 800, max: 1200 } },
    "BOG-BCN": { direct: { min: 1150, max: 1650 }, connecting: { min: 900, max: 1350 } },
    "BOG-TXL": { direct: { min: 1300, max: 1900 }, connecting: { min: 1000, max: 1500 } },
    "BOG-AMS": { direct: { min: 1200, max: 1700 }, connecting: { min: 950, max: 1400 } },
    "BOG-MIA": { direct: { min: 600, max: 900 }, connecting: { min: 450, max: 700 } },
    "BOG-YYZ": { direct: { min: 1100, max: 1600 }, connecting: { min: 800, max: 1200 } },
    "BOG-PEK": { direct: { min: 2500, max: 3500 }, connecting: { min: 1500, max: 2200 } },
    "BOG-NRT": { direct: { min: 2800, max: 3800 }, connecting: { min: 1800, max: 2500 } },
    "BOG-ICN": { direct: { min: 2600, max: 3600 }, connecting: { min: 1600, max: 2300 } },
    "BOG-SJO": { direct: { min: 400, max: 650 }, connecting: { min: 300, max: 500 } },
    "BOG-PTY": { direct: { min: 350, max: 550 }, connecting: { min: 250, max: 400 } },
  };

  const routeKey = `${origin}-${destination}`;
  const reverseKey = `${destination}-${origin}`;
  const priceRange = priceMatrix[routeKey] || priceMatrix[reverseKey] || {
    direct: { min: 1200, max: 1800 },
    connecting: { min: 900, max: 1400 },
  };

  return priceRange[type];
};

export const getVisaRequirements = (_origin: string, destination: string): string[] => {
  const requirements: string[] = [];

  if (["PEK", "NRT", "ICN", "SVO", "DEL", "SYD", "AKL"].includes(destination)) {
    requirements.push("Este destino suele requerir visa previa para viajeros colombianos.");
  }

  if (["YYZ", "LAX", "JFK", "MIA"].includes(destination)) {
    requirements.push("Estados Unidos requiere visa vigente para ingreso y varias conexiones.");
  }

  return requirements;
};

export const getRouteInfo = (origin: string, destination: string): RouteInfo => {
  const options = getRouteOptions(origin, destination);
  const visaRequirements = getVisaRequirements(origin, destination);

  return {
    options,
    visaRequirements,
    hasDirectFlights: options.some((option) => option.type === "direct" && option.available),
    totalOptions: options.length,
  };
};
