import { Flight, Airport } from "@/types/flight";
import { generateFlights } from "@/utils/flightGenerator";

// Aeropuertos principales
const airports: Record<string, Airport> = {
  BOG: { code: "BOG", name: "El Dorado International Airport", city: "Bogotá", country: "Colombia" },
  LHR: { code: "LHR", name: "Heathrow Airport", city: "Londres", country: "Reino Unido", terminal: "Terminal 5" },
  CDG: { code: "CDG", name: "Charles de Gaulle Airport", city: "París", country: "Francia", terminal: "Terminal 2E" },
  BCN: { code: "BCN", name: "Barcelona-El Prat Airport", city: "Barcelona", country: "España", terminal: "Terminal 1" },
  YYZ: { code: "YYZ", name: "Toronto Pearson International", city: "Toronto", country: "Canadá", terminal: "Terminal 1" },
  SJO: { code: "SJO", name: "Juan Santamaría International", city: "San José", country: "Costa Rica" },
  TXL: { code: "TXL", name: "Berlin Brandenburg Airport", city: "Berlín", country: "Alemania", terminal: "Terminal 1" },
  MAD: { code: "MAD", name: "Adolfo Suárez Madrid-Barajas", city: "Madrid", country: "España", terminal: "Terminal 4" },
  MIA: { code: "MIA", name: "Miami International Airport", city: "Miami", country: "Estados Unidos", terminal: "Terminal J" },
  AMS: { code: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Países Bajos" },
  PEK: { code: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China", terminal: "Terminal 3" }
};

export const mockFlights: Flight[] = [
  {
    id: "flight_1",
    airline: "British Airways",
    airlineCode: "BA",
    flightNumber: "BA2237",
    route: {
      origin: airports.BOG,
      destination: airports.LHR,
      stops: [airports.MAD],
      duration: { total: "14h 25m", flying: "12h 10m" },
      distance: 8544
    },
    schedule: {
      departure: { date: "2024-08-05", time: "23:45", timezone: "COT" },
      arrival: { date: "2024-08-06", time: "19:10", timezone: "GMT" },
      layovers: [{
        airport: airports.MAD,
        duration: "2h 15m"
      }]
    },
    aircraft: "Boeing 787-9",
    pricing: {
      currency: "USD",
      publicPrice: 1250,
      agencyPrice: 950,
      discount: 24,
      taxes: 180,
      fees: 45,
      total: 1175,
      priceBreakdown: {
        baseFare: 950,
        taxes: [
          { code: "YQ", name: "Fuel Surcharge", amount: 120 },
          { code: "GB", name: "UK Air Passenger Duty", amount: 60 }
        ],
        fees: [
          { type: "booking", description: "Booking Fee", amount: 25 },
          { type: "service", description: "Service Fee", amount: 20 }
        ]
      }
    },
    availability: {
      seats: 8,
      cabinClass: "economy",
      bookingClass: "M",
      refundable: false,
      changeable: true,
      lastUpdate: "2024-01-15T10:30:00Z"
    },
    services: {
      meals: ["Cena", "Desayuno"],
      entertainment: true,
      wifi: true,
      powerOutlets: true,
      extraLegroom: false
    },
    baggage: {
      carry: { included: true, weight: "8kg", dimensions: "56x45x25cm" },
      checked: { included: true, weight: "23kg" }
    },
    restrictions: {
      minStay: 7,
      maxStay: 365,
      advancePurchase: 14,
      cancellationPolicy: "Cambios permitidos con tarifa",
      changePolicy: "Cambios: $150 USD + diferencia tarifaria"
    }
  },

  {
    id: "flight_2",
    airline: "Air France",
    airlineCode: "AF",
    flightNumber: "AF422",
    route: {
      origin: airports.BOG,
      destination: airports.CDG,
      stops: [],
      duration: { total: "10h 45m", flying: "10h 45m" },
      distance: 8498
    },
    schedule: {
      departure: { date: "2024-09-02", time: "22:30", timezone: "COT" },
      arrival: { date: "2024-09-03", time: "15:15", timezone: "CET" }
    },
    aircraft: "Airbus A330-200",
    pricing: {
      currency: "USD",
      publicPrice: 1180,
      agencyPrice: 890,
      discount: 25,
      taxes: 165,
      fees: 40,
      total: 1095,
      priceBreakdown: {
        baseFare: 890,
        taxes: [
          { code: "YQ", name: "Fuel Surcharge", amount: 95 },
          { code: "FR", name: "France Solidarity Tax", amount: 70 }
        ],
        fees: [
          { type: "booking", description: "Booking Fee", amount: 25 },
          { type: "service", description: "Service Fee", amount: 15 }
        ]
      }
    },
    availability: {
      seats: 12,
      cabinClass: "economy",
      bookingClass: "Y",
      refundable: true,
      changeable: true,
      lastUpdate: "2024-01-15T10:30:00Z"
    },
    services: {
      meals: ["Cena", "Desayuno"],
      entertainment: true,
      wifi: true,
      powerOutlets: true,
      extraLegroom: false
    },
    baggage: {
      carry: { included: true, weight: "12kg", dimensions: "55x35x25cm" },
      checked: { included: true, weight: "23kg" }
    },
    restrictions: {
      minStay: 7,
      maxStay: 365,
      advancePurchase: 21,
      cancellationPolicy: "Reembolsable con penalidad",
      changePolicy: "Cambios: $100 USD + diferencia tarifaria"
    }
  },

  {
    id: "flight_7",
    airline: "Air China",
    airlineCode: "CA",
    flightNumber: "CA908",
    route: {
      origin: airports.BOG,
      destination: airports.PEK,
      stops: [airports.MAD, airports.AMS],
      duration: { total: "24h 30m", flying: "19h 15m" },
      distance: 17854
    },
    schedule: {
      departure: { date: "2024-08-20", time: "14:30", timezone: "COT" },
      arrival: { date: "2024-08-22", time: "09:00", timezone: "CST" },
      layovers: [
        { airport: airports.MAD, duration: "3h 45m" },
        { airport: airports.AMS, duration: "1h 30m" }
      ]
    },
    aircraft: "Boeing 777-300ER",
    pricing: {
      currency: "USD",
      publicPrice: 2200,
      agencyPrice: 1650,
      discount: 25,
      taxes: 320,
      fees: 85,
      total: 2055,
      priceBreakdown: {
        baseFare: 1650,
        taxes: [
          { code: "YQ", name: "Fuel Surcharge", amount: 180 },
          { code: "CN", name: "China Airport Tax", amount: 140 }
        ],
        fees: [
          { type: "booking", description: "Booking Fee", amount: 45 },
          { type: "service", description: "Service Fee", amount: 40 }
        ]
      }
    },
    availability: {
      seats: 4,
      cabinClass: "economy",
      bookingClass: "T",
      refundable: false,
      changeable: true,
      lastUpdate: "2024-01-15T10:30:00Z"
    },
    services: {
      meals: ["Almuerzo", "Cena", "Desayuno"],
      entertainment: true,
      wifi: true,
      powerOutlets: true,
      extraLegroom: false
    },
    baggage: {
      carry: { included: true, weight: "10kg", dimensions: "56x45x25cm" },
      checked: { included: true, weight: "23kg" }
    },
    restrictions: {
      minStay: 7,
      maxStay: 90,
      advancePurchase: 21,
      cancellationPolicy: "No reembolsable",
      changePolicy: "Cambios: $200 USD + diferencia tarifaria"
    }
  },

  {
    id: "flight_8",
    airline: "Avianca",
    airlineCode: "AV",
    flightNumber: "AV027",
    route: {
      origin: airports.BOG,
      destination: airports.MAD,
      stops: [],
      duration: { total: "9h 30m", flying: "9h 30m" },
      distance: 8048
    },
    schedule: {
      departure: { date: "2024-08-15", time: "23:55", timezone: "COT" },
      arrival: { date: "2024-08-16", time: "16:25", timezone: "CET" }
    },
    aircraft: "Boeing 787-8",
    pricing: {
      currency: "USD",
      publicPrice: 1500,
      agencyPrice: 1125,
      discount: 25,
      taxes: 195,
      fees: 55,
      total: 1375,
      priceBreakdown: {
        baseFare: 1125,
        taxes: [
          { code: "YQ", name: "Fuel Surcharge", amount: 125 },
          { code: "ES", name: "Spain Airport Tax", amount: 70 }
        ],
        fees: [
          { type: "booking", description: "Booking Fee", amount: 35 },
          { type: "service", description: "Service Fee", amount: 20 }
        ]
      }
    },
    availability: {
      seats: 18,
      cabinClass: "economy",
      bookingClass: "Y",
      refundable: true,
      changeable: true,
      lastUpdate: "2024-01-15T10:30:00Z"
    },
    services: {
      meals: ["Cena", "Desayuno"],
      entertainment: true,
      wifi: true,
      powerOutlets: true,
      extraLegroom: false
    },
    baggage: {
      carry: { included: true, weight: "10kg", dimensions: "56x45x25cm" },
      checked: { included: true, weight: "23kg" }
    },
    restrictions: {
      minStay: 7,
      maxStay: 365,
      advancePurchase: 14,
      cancellationPolicy: "Reembolsable con penalidad de $150",
      changePolicy: "Cambios: $100 USD + diferencia tarifaria"
    }
  }
];

// Función helper para buscar vuelos
export const searchFlights = (criteria: any) => {
  let results: Flight[] = [];
  
  // Primero buscar en vuelos predefinidos que coincidan con origen y destino
  const matchingPredefined = mockFlights.filter(flight => {
    if (criteria.origin && flight.route.origin.code !== criteria.origin) return false;
    if (criteria.destination && flight.route.destination.code !== criteria.destination) return false;
    return true;
  });
  
  // Separar vuelos predefinidos por tipo
  const predefinedDirect = matchingPredefined.filter(flight => flight.route.stops.length === 0);
  const predefinedConnecting = matchingPredefined.filter(flight => flight.route.stops.length > 0);
  
  // Si hay criterios de origen y destino, generar vuelos adicionales para asegurar ambos tipos
  if (criteria.origin && criteria.destination && criteria.origin !== criteria.destination) {
    console.log(`Generando vuelos para ${criteria.origin} → ${criteria.destination}`);
    
    // Generar vuelos directos si no tenemos suficientes predefinidos
    if (predefinedDirect.length < 2) {
      const generatedDirect = generateFlights(
        criteria.origin, 
        criteria.destination, 
        'direct'
      );
      results.push(...generatedDirect);
    }
    
    // Generar vuelos con escalas si no tenemos suficientes predefinidos  
    if (predefinedConnecting.length < 2) {
      const generatedConnecting = generateFlights(
        criteria.origin, 
        criteria.destination, 
        'connecting'
      );
      results.push(...generatedConnecting);
    }
  }
  
  // Agregar los vuelos predefinidos que coinciden
  results.push(...matchingPredefined);
  
  // Filtrar por tipo de ruta solo si se especifica un filtro específico
  if (criteria.routeType === 'direct') {
    results = results.filter(flight => flight.route.stops.length === 0);
  } else if (criteria.routeType === 'connecting') {
    results = results.filter(flight => flight.route.stops.length > 0);
  }
  // Si routeType es 'both' o no se especifica, mostrar todos
  
  // Asegurar que siempre tengamos al menos algunos ejemplos de ambos tipos
  // (a menos que se haya aplicado un filtro específico)
  if (!criteria.routeType || criteria.routeType === 'both') {
    const directInResults = results.filter(flight => flight.route.stops.length === 0);
    const connectingInResults = results.filter(flight => flight.route.stops.length > 0);
    
    // Si no tenemos vuelos directos, generar algunos
    if (directInResults.length === 0 && criteria.origin && criteria.destination) {
      const additionalDirect = generateFlights(criteria.origin, criteria.destination, 'direct');
      results.push(...additionalDirect.slice(0, 2)); // Agregar máximo 2
    }
    
    // Si no tenemos vuelos con escalas, generar algunos
    if (connectingInResults.length === 0 && criteria.origin && criteria.destination) {
      const additionalConnecting = generateFlights(criteria.origin, criteria.destination, 'connecting');
      results.push(...additionalConnecting.slice(0, 2)); // Agregar máximo 2
    }
  }
  
  return results;
}; 