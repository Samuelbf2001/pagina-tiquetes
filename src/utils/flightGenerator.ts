import { Flight, Airport } from "@/types/flight";

// Lista completa de aeropuertos para generar vuelos
const airports: Record<string, Airport> = {
  // Colombia
  BOG: { code: "BOG", name: "El Dorado International Airport", city: "Bogotá", country: "Colombia" },
  
  // Europa
  LHR: { code: "LHR", name: "Heathrow Airport", city: "Londres", country: "Reino Unido", terminal: "Terminal 5" },
  CDG: { code: "CDG", name: "Charles de Gaulle Airport", city: "París", country: "Francia", terminal: "Terminal 2E" },
  BCN: { code: "BCN", name: "Barcelona-El Prat Airport", city: "Barcelona", country: "España", terminal: "Terminal 1" },
  MAD: { code: "MAD", name: "Adolfo Suárez Madrid-Barajas", city: "Madrid", country: "España", terminal: "Terminal 4" },
  TXL: { code: "TXL", name: "Berlin Brandenburg Airport", city: "Berlín", country: "Alemania", terminal: "Terminal 1" },
  AMS: { code: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Países Bajos" },
  
  // América del Norte
  MIA: { code: "MIA", name: "Miami International Airport", city: "Miami", country: "Estados Unidos", terminal: "Terminal J" },
  YYZ: { code: "YYZ", name: "Toronto Pearson International", city: "Toronto", country: "Canadá", terminal: "Terminal 1" },
  
  // Asia
  PEK: { code: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China", terminal: "Terminal 3" },
  NRT: { code: "NRT", name: "Narita International Airport", city: "Tokio", country: "Japón", terminal: "Terminal 1" },
  ICN: { code: "ICN", name: "Incheon International Airport", city: "Seúl", country: "Corea del Sur", terminal: "Terminal 1" },
  SIN: { code: "SIN", name: "Singapore Changi Airport", city: "Singapur", country: "Singapur", terminal: "Terminal 3" },
  DXB: { code: "DXB", name: "Dubai International Airport", city: "Dubái", country: "Emiratos Árabes Unidos", terminal: "Terminal 3" },
  
  // Centro América y Caribe
  SJO: { code: "SJO", name: "Juan Santamaría International", city: "San José", country: "Costa Rica" }
};

// Aerolíneas para variar los vuelos
const airlines = [
  { name: "Avianca", code: "AV", region: "americas" },
  { name: "LATAM", code: "LA", region: "americas" },
  { name: "Air France", code: "AF", region: "europe" },
  { name: "Lufthansa", code: "LH", region: "europe" },
  { name: "KLM", code: "KL", region: "europe" },
  { name: "Iberia", code: "IB", region: "europe" },
  { name: "British Airways", code: "BA", region: "europe" },
  { name: "Air China", code: "CA", region: "asia" },
  { name: "Emirates", code: "EK", region: "middle-east" },
  { name: "Singapore Airlines", code: "SQ", region: "asia" },
  { name: "Air Canada", code: "AC", region: "americas" }
];

// Aeropuertos comunes para escalas según región
const hubAirports = {
  europe: ["MAD", "CDG", "AMS", "LHR"],
  americas: ["MIA", "YYZ"],
  asia: ["DXB", "SIN"],
  middleEast: ["DXB"]
};

// Función para calcular distancia aproximada (simplificada)
const calculateDistance = (origin: string, destination: string): number => {
  const distances: Record<string, number> = {
    // Distancias base desde Colombia
    "BOG-LHR": 8500, "BOG-CDG": 8400, "BOG-MAD": 8000, "BOG-BCN": 8200,
    "BOG-TXL": 8800, "BOG-AMS": 8600, "BOG-MIA": 1600, "BOG-YYZ": 4200,
    "BOG-PEK": 17800, "BOG-NRT": 18500, "BOG-ICN": 18200, "BOG-SIN": 19000,
    "BOG-DXB": 13500, "BOG-SJO": 1200
  };
  
  const key = `${origin}-${destination}`;
  const reverseKey = `${destination}-${origin}`;
  
  return distances[key] || distances[reverseKey] || 8000; // Default distance
};

// Función para determinar si una ruta tiene vuelos directos
const hasDirectRoute = (origin: string, destination: string): boolean => {
  // Lista expandida de rutas directas - incluye la mayoría de combinaciones principales
  const directRoutes = new Set([
    // Desde/hacia Colombia (BOG)
    "BOG-MIA", "MIA-BOG", "BOG-MAD", "MAD-BOG", "BOG-CDG", "CDG-BOG", 
    "BOG-AMS", "AMS-BOG", "BOG-YYZ", "YYZ-BOG", "BOG-SJO", "SJO-BOG",
    "BOG-LHR", "LHR-BOG", "BOG-BCN", "BCN-BOG", "BOG-TXL", "TXL-BOG",
    "BOG-PEK", "PEK-BOG", "BOG-NRT", "NRT-BOG", "BOG-ICN", "ICN-BOG",
    "BOG-SIN", "SIN-BOG", "BOG-DXB", "DXB-BOG",
    
    // Rutas europeas directas
    "LHR-CDG", "CDG-LHR", "LHR-MAD", "MAD-LHR", "LHR-BCN", "BCN-LHR",
    "LHR-TXL", "TXL-LHR", "LHR-AMS", "AMS-LHR", "CDG-MAD", "MAD-CDG",
    "CDG-BCN", "BCN-CDG", "CDG-TXL", "TXL-CDG", "CDG-AMS", "AMS-CDG",
    "MAD-BCN", "BCN-MAD", "MAD-TXL", "TXL-MAD", "MAD-AMS", "AMS-MAD",
    "BCN-TXL", "TXL-BCN", "BCN-AMS", "AMS-BCN", "TXL-AMS", "AMS-TXL",
    
    // Rutas transatlánticas
    "LHR-MIA", "MIA-LHR", "LHR-YYZ", "YYZ-LHR", "CDG-MIA", "MIA-CDG",
    "CDG-YYZ", "YYZ-CDG", "MAD-MIA", "MIA-MAD", "MAD-YYZ", "YYZ-MAD",
    "AMS-MIA", "MIA-AMS", "AMS-YYZ", "YYZ-AMS", "BCN-MIA", "MIA-BCN",
    
    // Rutas asiáticas
    "PEK-NRT", "NRT-PEK", "PEK-ICN", "ICN-PEK", "PEK-SIN", "SIN-PEK",
    "PEK-DXB", "DXB-PEK", "NRT-ICN", "ICN-NRT", "NRT-SIN", "SIN-NRT",
    "NRT-DXB", "DXB-NRT", "ICN-SIN", "SIN-ICN", "ICN-DXB", "DXB-ICN",
    "SIN-DXB", "DXB-SIN",
    
    // Europa a Asia
    "LHR-PEK", "PEK-LHR", "LHR-NRT", "NRT-LHR", "LHR-ICN", "ICN-LHR",
    "LHR-SIN", "SIN-LHR", "LHR-DXB", "DXB-LHR", "CDG-PEK", "PEK-CDG",
    "CDG-NRT", "NRT-CDG", "CDG-ICN", "ICN-CDG", "CDG-SIN", "SIN-CDG",
    "CDG-DXB", "DXB-CDG", "MAD-DXB", "DXB-MAD", "AMS-DXB", "DXB-AMS",
    "AMS-PEK", "PEK-AMS", "AMS-NRT", "NRT-AMS", "AMS-SIN", "SIN-AMS",
    
    // América del Norte a Asia
    "MIA-PEK", "PEK-MIA", "MIA-NRT", "NRT-MIA", "MIA-ICN", "ICN-MIA",
    "MIA-SIN", "SIN-MIA", "MIA-DXB", "DXB-MIA", "YYZ-PEK", "PEK-YYZ",
    "YYZ-NRT", "NRT-YYZ", "YYZ-ICN", "ICN-YYZ", "YYZ-SIN", "SIN-YYZ",
    "YYZ-DXB", "DXB-YYZ",
    
    // Centroamérica
    "SJO-MIA", "MIA-SJO", "SJO-YYZ", "YYZ-SJO", "SJO-MAD", "MAD-SJO",
    "SJO-CDG", "CDG-SJO", "SJO-AMS", "AMS-SJO"
  ]);
  
  const route1 = `${origin}-${destination}`;
  const route2 = `${destination}-${origin}`;
  
  return directRoutes.has(route1) || directRoutes.has(route2);
};

// Función para calcular precios basados en distancia y tipo
const calculatePrice = (distance: number, routeType: 'direct' | 'connecting'): { public: number, agency: number } => {
  let basePrice = Math.round((distance / 10) + 300); // Precio base por distancia
  
  if (routeType === 'connecting') {
    basePrice *= 0.8; // 20% más barato para vuelos con escalas
  }
  
  const publicPrice = Math.round(basePrice * 1.4); // Precio público 40% más caro
  const agencyPrice = basePrice; // Precio B2B
  
  return { public: publicPrice, agency: agencyPrice };
};

// Función para generar horarios realistas
const generateSchedule = (distance: number, routeType: 'direct' | 'connecting') => {
  const flightDuration = routeType === 'direct' ? 
    Math.round(distance / 800) : // 800 km/h promedio
    Math.round(distance / 700); // Más lento por escalas
  
  const layoverTime = routeType === 'connecting' ? 
    Math.floor(Math.random() * 4) + 1 : 0; // 1-5 horas de escalas
  
  const totalHours = flightDuration + layoverTime;
  const totalMinutes = Math.floor(Math.random() * 60);
  
  return {
    flying: `${flightDuration}h ${Math.floor(Math.random() * 60)}m`,
    total: `${totalHours}h ${totalMinutes}m`
  };
};

// Función para seleccionar aerolínea apropiada
const selectAirline = (origin: string, destination: string) => {
  // Preferir aerolíneas regionales apropiadas
  if (origin === 'BOG' || destination === 'BOG') {
    const americasAirlines = airlines.filter(a => a.region === 'americas');
    if (Math.random() > 0.3) {
      return americasAirlines[Math.floor(Math.random() * americasAirlines.length)];
    }
  }
  
  return airlines[Math.floor(Math.random() * airlines.length)];
};

// Función para generar escalas apropiadas
const generateStops = (origin: string, destination: string): Airport[] => {
  if (origin === destination) return [];
  
  const possibleHubs = [...hubAirports.europe, ...hubAirports.americas, ...hubAirports.asia];
  const numStops = Math.random() > 0.7 ? 2 : 1; // 70% chance de 1 escala, 30% de 2
  
  const stops: Airport[] = [];
  const usedHubs = new Set([origin, destination]);
  
  for (let i = 0; i < numStops; i++) {
    const availableHubs = possibleHubs.filter(hub => !usedHubs.has(hub));
    if (availableHubs.length > 0) {
      const hub = availableHubs[Math.floor(Math.random() * availableHubs.length)];
      if (airports[hub]) {
        stops.push(airports[hub]);
        usedHubs.add(hub);
      }
    }
  }
  
  return stops;
};

// Función principal para generar vuelos
export const generateFlights = (origin: string, destination: string, routeType?: 'direct' | 'connecting' | 'both'): Flight[] => {
  if (!origin || !destination || origin === destination) {
    return [];
  }
  
  const originAirport = airports[origin];
  const destinationAirport = airports[destination];
  
  if (!originAirport || !destinationAirport) {
    return [];
  }
  
  const flights: Flight[] = [];
  const distance = calculateDistance(origin, destination);
  const hasDirect = hasDirectRoute(origin, destination);
  
  // Generar vuelos directos
  if ((routeType === 'direct' || routeType === 'both' || !routeType) && hasDirect) {
    const directFlights = generateFlightVariations(originAirport, destinationAirport, 'direct', distance);
    flights.push(...directFlights);
  }
  
  // Generar vuelos con escalas (siempre disponibles para rutas internacionales)
  if (routeType === 'connecting' || routeType === 'both' || !routeType) {
    const connectingFlights = generateFlightVariations(originAirport, destinationAirport, 'connecting', distance);
    flights.push(...connectingFlights);
  }
  
  // Si no hay vuelos directos pero se solicitaron, aún así generar algunos con escalas
  if ((routeType === 'direct' || routeType === 'both' || !routeType) && !hasDirect && flights.length === 0) {
    console.log(`No hay vuelos directos para ${origin}-${destination}, generando con escalas como alternativa`);
    const alternativeFlights = generateFlightVariations(originAirport, destinationAirport, 'connecting', distance);
    flights.push(...alternativeFlights);
  }
  
  return flights;
};

// Función para generar variaciones de vuelos
const generateFlightVariations = (origin: Airport, destination: Airport, routeType: 'direct' | 'connecting', distance: number): Flight[] => {
  const flights: Flight[] = [];
  const numFlights = routeType === 'direct' ? 
    Math.floor(Math.random() * 2) + 2 : // 2-3 vuelos directos
    Math.floor(Math.random() * 3) + 2;   // 2-4 vuelos con escalas
  
  for (let i = 0; i < numFlights; i++) {
    const airline = selectAirline(origin.code, destination.code);
    const prices = calculatePrice(distance, routeType);
    const schedule = generateSchedule(distance, routeType);
    const stops = routeType === 'connecting' ? generateStops(origin.code, destination.code) : [];
    
    // Variar horarios para dar más opciones
    const departureHour = routeType === 'direct' ? 
      [6, 10, 14, 18, 22][i % 5] : // Horarios más distribuidos para directos
      [8, 12, 16, 20][i % 4];      // Horarios para vuelos con escalas
    
    const departureMinutes = [0, 15, 30, 45][i % 4];
    
    // Calcular hora de llegada basada en duración
    const totalMinutes = parseInt(schedule.total.split('h')[0]) * 60 + 
                        parseInt(schedule.total.split('h')[1].split('m')[0]);
    const arrivalTime = new Date();
    arrivalTime.setHours(departureHour, departureMinutes);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + totalMinutes);
    
    const flight: Flight = {
      id: `generated_${origin.code}_${destination.code}_${routeType}_${i}_${Date.now()}`,
      airline: airline.name,
      airlineCode: airline.code,
      flightNumber: `${airline.code}${Math.floor(Math.random() * 900) + 100}`,
      route: {
        origin,
        destination,
        stops,
        duration: schedule,
        distance
      },
      schedule: {
        departure: {
          date: "2024-08-20", // Fecha placeholder
          time: `${String(departureHour).padStart(2, '0')}:${String(departureMinutes).padStart(2, '0')}`,
          timezone: "COT"
        },
        arrival: {
          date: arrivalTime.getDate() !== 20 ? "2024-08-21" : "2024-08-20", // Considerar cambio de día
          time: `${String(arrivalTime.getHours()).padStart(2, '0')}:${String(arrivalTime.getMinutes()).padStart(2, '0')}`,
          timezone: getDestinationTimezone(destination.code)
        },
        layovers: stops.map((stop, index) => ({
          airport: stop,
          duration: generateLayoverDuration(index, stops.length)
        }))
      },
      aircraft: getRealisticAircraft(distance, routeType),
      pricing: {
        currency: "USD",
        publicPrice: prices.public,
        agencyPrice: prices.agency,
        discount: Math.round(((prices.public - prices.agency) / prices.public) * 100),
        taxes: Math.round(prices.agency * 0.15),
        fees: Math.round(prices.agency * 0.05),
        total: Math.round(prices.agency * 1.2),
        priceBreakdown: {
          baseFare: prices.agency,
          taxes: [
            { code: "YQ", name: "Fuel Surcharge", amount: Math.round(prices.agency * 0.1) },
            { code: "TX", name: "Airport Tax", amount: Math.round(prices.agency * 0.05) }
          ],
          fees: [
            { type: "booking", description: "Booking Fee", amount: Math.round(prices.agency * 0.03) },
            { type: "service", description: "Service Fee", amount: Math.round(prices.agency * 0.02) }
          ]
        }
      },
      availability: {
        seats: Math.floor(Math.random() * 15) + 5, // 5-19 asientos
        cabinClass: "economy",
        bookingClass: ["Y", "M", "B", "T", "K"][Math.floor(Math.random() * 5)],
        refundable: Math.random() > 0.4, // 60% chance de ser reembolsable
        changeable: Math.random() > 0.2, // 80% chance de ser cambiable
        lastUpdate: new Date().toISOString()
      },
      services: {
        meals: routeType === 'direct' ? 
          ["Cena", "Desayuno"].slice(0, Math.floor(Math.random() * 2) + 1) :
          ["Desayuno", "Almuerzo", "Cena"].slice(0, Math.floor(Math.random() * 2) + 2),
        entertainment: true, // Siempre incluir para vuelos internacionales
        wifi: Math.random() > 0.3, // 70% chance
        powerOutlets: Math.random() > 0.4, // 60% chance
        extraLegroom: Math.random() > 0.8 // 20% chance
      },
      baggage: {
        carry: { included: true, weight: "10kg", dimensions: "56x45x25cm" },
        checked: { included: true, weight: "23kg" }
      },
      restrictions: {
        minStay: Math.floor(Math.random() * 7) + 1,
        maxStay: Math.floor(Math.random() * 300) + 60,
        advancePurchase: Math.floor(Math.random() * 21) + 7,
        cancellationPolicy: Math.random() > 0.5 ? "Reembolsable con penalidad" : "No reembolsable",
        changePolicy: `Cambios: $${Math.floor(Math.random() * 200) + 50} USD + diferencia tarifaria`
      }
    };
    
    flights.push(flight);
  }
  
  return flights;
};

// Funciones helper adicionales
const generateLayoverDuration = (index: number, totalStops: number): string => {
  // Primera escala: más tiempo, última escala: menos tiempo
  const baseMinutes = index === 0 ? 120 : 90; // 2h primera, 1.5h otras
  const variation = Math.floor(Math.random() * 60) - 30; // ±30 min
  const totalMinutes = Math.max(60, baseMinutes + variation); // Mínimo 1h
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`.trim();
};

const getRealisticAircraft = (distance: number, routeType: 'direct' | 'connecting'): string => {
  const longHaulAircraft = ["Boeing 787-9", "Airbus A350-900", "Boeing 777-300ER"];
  const mediumHaulAircraft = ["Airbus A330-200", "Boeing 767-300", "Airbus A321"];
  
  if (distance > 8000) {
    return longHaulAircraft[Math.floor(Math.random() * longHaulAircraft.length)];
  } else {
    return mediumHaulAircraft[Math.floor(Math.random() * mediumHaulAircraft.length)];
  }
};

const getDestinationTimezone = (airportCode: string): string => {
  const timezones: Record<string, string> = {
    'BOG': 'COT',
    'LHR': 'GMT', 'CDG': 'CET', 'MAD': 'CET', 'BCN': 'CET', 'TXL': 'CET', 'AMS': 'CET',
    'MIA': 'EST', 'YYZ': 'EST',
    'PEK': 'CST', 'NRT': 'JST', 'ICN': 'KST', 'SIN': 'SGT', 'DXB': 'GST',
    'SJO': 'CST'
  };
  
  return timezones[airportCode] || 'UTC';
}; 