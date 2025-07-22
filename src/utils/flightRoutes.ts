import { FlightRouteOption } from "@/types/flight";

// Definir rutas que tienen vuelos directos
const directRoutes = new Set([
  "BOG-MIA", "BOG-MAD", "BOG-CDG", "BOG-AMS",
  "MIA-BOG", "MAD-BOG", "CDG-BOG", "AMS-BOG"
]);

// Función para obtener opciones de ruta según origen y destino
export const getRouteOptions = (origin: string, destination: string): FlightRouteOption[] => {
  if (!origin || !destination) {
    return [];
  }

  const routeKey = `${origin}-${destination}`;
  const reverseRouteKey = `${destination}-${origin}`;
  
  const hasDirectFlight = directRoutes.has(routeKey) || directRoutes.has(reverseRouteKey);
  
  const options: FlightRouteOption[] = [];

  // Siempre hay vuelos con escalas disponibles para rutas internacionales
  options.push({
    type: 'connecting',
    label: 'Vuelos con Escalas',
    description: 'Múltiples opciones con conexiones, usualmente más económicos',
    available: true,
    estimatedPrice: {
      min: getEstimatedPrice(origin, destination, 'connecting').min,
      max: getEstimatedPrice(origin, destination, 'connecting').max
    }
  });

  // Agregar vuelos directos solo si están disponibles
  if (hasDirectFlight) {
    options.unshift({
      type: 'direct',
      label: 'Vuelos Directos',
      description: 'Sin escalas, más rápido y conveniente',
      available: true,
      estimatedPrice: {
        min: getEstimatedPrice(origin, destination, 'direct').min,
        max: getEstimatedPrice(origin, destination, 'direct').max
      }
    });
  }

  return options;
};

// Función para estimar precios según la ruta y tipo
const getEstimatedPrice = (origin: string, destination: string, type: 'direct' | 'connecting') => {
  // Precios base por región (en USD)
  const priceMatrix: Record<string, { direct: { min: number, max: number }, connecting: { min: number, max: number } }> = {
    // Europa
    'BOG-LHR': { direct: { min: 1200, max: 1800 }, connecting: { min: 900, max: 1400 } },
    'BOG-CDG': { direct: { min: 1100, max: 1600 }, connecting: { min: 850, max: 1300 } },
    'BOG-MAD': { direct: { min: 1000, max: 1500 }, connecting: { min: 800, max: 1200 } },
    'BOG-BCN': { direct: { min: 1150, max: 1650 }, connecting: { min: 900, max: 1350 } },
    'BOG-TXL': { direct: { min: 1300, max: 1900 }, connecting: { min: 1000, max: 1500 } },
    'BOG-AMS': { direct: { min: 1200, max: 1700 }, connecting: { min: 950, max: 1400 } },
    
    // América del Norte
    'BOG-MIA': { direct: { min: 600, max: 900 }, connecting: { min: 450, max: 700 } },
    'BOG-YYZ': { direct: { min: 1100, max: 1600 }, connecting: { min: 800, max: 1200 } },
    
    // Asia (rutas más largas, solo con escalas)
    'BOG-PEK': { direct: { min: 2500, max: 3500 }, connecting: { min: 1500, max: 2200 } },
    'BOG-NRT': { direct: { min: 2800, max: 3800 }, connecting: { min: 1800, max: 2500 } },
    'BOG-ICN': { direct: { min: 2600, max: 3600 }, connecting: { min: 1600, max: 2300 } },
    
    // Centro América y Caribe
    'BOG-SJO': { direct: { min: 400, max: 650 }, connecting: { min: 300, max: 500 } },
    'BOG-PTY': { direct: { min: 350, max: 550 }, connecting: { min: 250, max: 400 } }
  };

  const routeKey = `${origin}-${destination}`;
  const reverseKey = `${destination}-${origin}`;
  
  let prices = priceMatrix[routeKey] || priceMatrix[reverseKey];
  
  // Si no existe en la matriz, usar precios por defecto
  if (!prices) {
    prices = {
      direct: { min: 1200, max: 1800 },
      connecting: { min: 900, max: 1400 }
    };
  }

  return prices[type];
};

// Función para determinar si una ruta necesita visa especial
export const getVisaRequirements = (origin: string, destination: string): string[] => {
  const requirements: string[] = [];
  
  // Países que típicamente requieren visa para colombianos
  const visaRequiredCountries = ['CHN', 'JPN', 'KOR', 'RUS', 'IND', 'AUS', 'NZL'];
  const visaRequiredDestinations = ['PEK', 'NRT', 'ICN', 'SVO', 'DEL', 'SYD', 'AKL'];
  
  if (visaRequiredDestinations.includes(destination)) {
    requirements.push('Visa requerida');
  }
  
  // USA transit visa
  if (destination === 'YYZ' || destination === 'LAX' || destination === 'JFK') {
    requirements.push('Visa americana recomendada para conexiones');
  }
  
  return requirements;
};

// Función para obtener información de la ruta
export const getRouteInfo = (origin: string, destination: string) => {
  const routeOptions = getRouteOptions(origin, destination);
  const visaRequirements = getVisaRequirements(origin, destination);
  
  return {
    options: routeOptions,
    visaRequirements,
    hasDirectFlights: routeOptions.some(option => option.type === 'direct' && option.available),
    totalOptions: routeOptions.length
  };
}; 