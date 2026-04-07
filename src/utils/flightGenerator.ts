import type { Airport, Flight, FlightRouteType } from "@/types/flight";
import { getCountryCodeFromAirport } from "@/utils/airportCountryMapping";
import { buildScheduleFromDeparture, normalizeIsoDate } from "@/utils/dateUtils";

const airports: Record<string, Airport> = {
  BOG: { code: "BOG", name: "El Dorado International Airport", city: "Bogota", country: "Colombia" },
  MDE: { code: "MDE", name: "Jose Maria Cordova", city: "Medellin", country: "Colombia" },
  CLO: { code: "CLO", name: "Alfonso Bonilla Aragon", city: "Cali", country: "Colombia" },
  CTG: { code: "CTG", name: "Rafael Nunez", city: "Cartagena", country: "Colombia" },
  BAQ: { code: "BAQ", name: "Ernesto Cortissoz", city: "Barranquilla", country: "Colombia" },
  BGA: { code: "BGA", name: "Palonegro", city: "Bucaramanga", country: "Colombia" },
  PEI: { code: "PEI", name: "Matecana", city: "Pereira", country: "Colombia" },
  SMR: { code: "SMR", name: "Simon Bolivar", city: "Santa Marta", country: "Colombia" },
  CUC: { code: "CUC", name: "Camilo Daza", city: "Cucuta", country: "Colombia" },
  VVC: { code: "VVC", name: "Vanguardia", city: "Villavicencio", country: "Colombia" },
  LHR: { code: "LHR", name: "Heathrow Airport", city: "Londres", country: "Reino Unido", terminal: "Terminal 5" },
  CDG: { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "Francia", terminal: "Terminal 2E" },
  BCN: { code: "BCN", name: "Barcelona-El Prat Airport", city: "Barcelona", country: "Espana", terminal: "Terminal 1" },
  MAD: { code: "MAD", name: "Adolfo Suarez Madrid-Barajas", city: "Madrid", country: "Espana", terminal: "Terminal 4" },
  TXL: { code: "TXL", name: "Berlin Brandenburg Airport", city: "Berlin", country: "Alemania", terminal: "Terminal 1" },
  AMS: { code: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Paises Bajos" },
  MIA: { code: "MIA", name: "Miami International Airport", city: "Miami", country: "Estados Unidos", terminal: "Terminal J" },
  YYZ: { code: "YYZ", name: "Toronto Pearson International", city: "Toronto", country: "Canada", terminal: "Terminal 1" },
  PEK: { code: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China", terminal: "Terminal 3" },
  NRT: { code: "NRT", name: "Narita International Airport", city: "Tokio", country: "Japon", terminal: "Terminal 1" },
  ICN: { code: "ICN", name: "Incheon International Airport", city: "Seul", country: "Corea del Sur", terminal: "Terminal 1" },
  SIN: { code: "SIN", name: "Singapore Changi Airport", city: "Singapur", country: "Singapur", terminal: "Terminal 3" },
  DXB: { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "Emiratos Arabes Unidos", terminal: "Terminal 3" },
  SJO: { code: "SJO", name: "Juan Santamaria International", city: "San Jose", country: "Costa Rica" },
};

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
  { name: "Air Canada", code: "AC", region: "americas" },
];

const hubAirports = {
  europe: ["MAD", "CDG", "AMS", "LHR"],
  americas: ["MIA", "YYZ"],
  asia: ["DXB", "SIN"],
  middleEast: ["DXB"],
} as const;

interface GenerateFlightsOptions {
  departureDate?: string;
  hasUsVisa?: boolean;
}

const calculateDistance = (origin: string, destination: string): number => {
  const distances: Record<string, number> = {
    "BOG-MDE": 215,
    "BOG-CLO": 280,
    "BOG-CTG": 660,
    "BOG-BAQ": 700,
    "BOG-BGA": 290,
    "BOG-PEI": 180,
    "BOG-SMR": 730,
    "BOG-CUC": 410,
    "BOG-VVC": 85,
    "MDE-CLO": 310,
    "MDE-CTG": 470,
    "MDE-BAQ": 540,
    "CLO-CTG": 770,
    "CLO-BAQ": 845,
    "CTG-BAQ": 100,
    "BOG-LHR": 8500,
    "BOG-CDG": 8400,
    "BOG-MAD": 8000,
    "BOG-BCN": 8200,
    "BOG-TXL": 8800,
    "BOG-AMS": 8600,
    "BOG-MIA": 1600,
    "BOG-YYZ": 4200,
    "BOG-PEK": 17800,
    "BOG-NRT": 18500,
    "BOG-ICN": 18200,
    "BOG-SIN": 19000,
    "BOG-DXB": 13500,
    "BOG-SJO": 1200,
  };

  const key = `${origin}-${destination}`;
  const reverseKey = `${destination}-${origin}`;

  if (getCountryCodeFromAirport(origin) === "CO" && getCountryCodeFromAirport(destination) === "CO") {
    return distances[key] || distances[reverseKey] || 350;
  }

  return distances[key] || distances[reverseKey] || 8000;
};

const hasDirectRoute = (origin: string, destination: string): boolean => {
  if (getCountryCodeFromAirport(origin) === "CO" && getCountryCodeFromAirport(destination) === "CO") {
    return true;
  }

  const directRoutes = new Set([
    "BOG-MIA",
    "MIA-BOG",
    "BOG-MAD",
    "MAD-BOG",
    "BOG-CDG",
    "CDG-BOG",
    "BOG-AMS",
    "AMS-BOG",
    "BOG-YYZ",
    "YYZ-BOG",
    "BOG-SJO",
    "SJO-BOG",
    "BOG-LHR",
    "LHR-BOG",
    "BOG-BCN",
    "BCN-BOG",
    "BOG-TXL",
    "TXL-BOG",
    "BOG-PEK",
    "PEK-BOG",
    "BOG-NRT",
    "NRT-BOG",
    "BOG-ICN",
    "ICN-BOG",
    "BOG-SIN",
    "SIN-BOG",
    "BOG-DXB",
    "DXB-BOG",
    "LHR-CDG",
    "CDG-LHR",
    "LHR-MAD",
    "MAD-LHR",
    "LHR-BCN",
    "BCN-LHR",
    "LHR-TXL",
    "TXL-LHR",
    "LHR-AMS",
    "AMS-LHR",
    "CDG-MAD",
    "MAD-CDG",
    "CDG-BCN",
    "BCN-CDG",
    "CDG-TXL",
    "TXL-CDG",
    "CDG-AMS",
    "AMS-CDG",
    "MAD-BCN",
    "BCN-MAD",
    "MAD-TXL",
    "TXL-MAD",
    "MAD-AMS",
    "AMS-MAD",
    "BCN-TXL",
    "TXL-BCN",
    "BCN-AMS",
    "AMS-BCN",
    "TXL-AMS",
    "AMS-TXL",
    "LHR-MIA",
    "MIA-LHR",
    "LHR-YYZ",
    "YYZ-LHR",
    "CDG-MIA",
    "MIA-CDG",
    "CDG-YYZ",
    "YYZ-CDG",
    "MAD-MIA",
    "MIA-MAD",
    "MAD-YYZ",
    "YYZ-MAD",
    "AMS-MIA",
    "MIA-AMS",
    "AMS-YYZ",
    "YYZ-AMS",
    "BCN-MIA",
    "MIA-BCN",
    "PEK-NRT",
    "NRT-PEK",
    "PEK-ICN",
    "ICN-PEK",
    "PEK-SIN",
    "SIN-PEK",
    "PEK-DXB",
    "DXB-PEK",
    "NRT-ICN",
    "ICN-NRT",
    "NRT-SIN",
    "SIN-NRT",
    "NRT-DXB",
    "DXB-NRT",
    "ICN-SIN",
    "SIN-ICN",
    "ICN-DXB",
    "DXB-ICN",
    "SIN-DXB",
    "DXB-SIN",
    "LHR-PEK",
    "PEK-LHR",
    "LHR-NRT",
    "NRT-LHR",
    "LHR-ICN",
    "ICN-LHR",
    "LHR-SIN",
    "SIN-LHR",
    "LHR-DXB",
    "DXB-LHR",
    "CDG-PEK",
    "PEK-CDG",
    "CDG-NRT",
    "NRT-CDG",
    "CDG-ICN",
    "ICN-CDG",
    "CDG-SIN",
    "SIN-CDG",
    "CDG-DXB",
    "DXB-CDG",
    "MAD-DXB",
    "DXB-MAD",
    "AMS-DXB",
    "DXB-AMS",
    "AMS-PEK",
    "PEK-AMS",
    "AMS-NRT",
    "NRT-AMS",
    "AMS-SIN",
    "SIN-AMS",
    "MIA-PEK",
    "PEK-MIA",
    "MIA-NRT",
    "NRT-MIA",
    "MIA-ICN",
    "ICN-MIA",
    "MIA-SIN",
    "SIN-MIA",
    "MIA-DXB",
    "DXB-MIA",
    "YYZ-PEK",
    "PEK-YYZ",
    "YYZ-NRT",
    "NRT-YYZ",
    "YYZ-ICN",
    "ICN-YYZ",
    "YYZ-SIN",
    "SIN-YYZ",
    "YYZ-DXB",
    "DXB-YYZ",
    "SJO-MIA",
    "MIA-SJO",
    "SJO-YYZ",
    "YYZ-SJO",
    "SJO-MAD",
    "MAD-SJO",
    "SJO-CDG",
    "CDG-SJO",
    "SJO-AMS",
    "AMS-SJO",
  ]);

  return directRoutes.has(`${origin}-${destination}`) || directRoutes.has(`${destination}-${origin}`);
};

const calculatePrice = (
  distance: number,
  routeType: Extract<FlightRouteType, "direct" | "connecting">
) => {
  let basePrice = Math.round(distance / 10 + 300);

  if (routeType === "connecting") {
    basePrice *= 0.8;
  }

  return {
    public: Math.round(basePrice * 1.4),
    agency: basePrice,
  };
};

const generateSchedule = (
  distance: number,
  routeType: Extract<FlightRouteType, "direct" | "connecting">
) => {
  const flightDurationHours =
    routeType === "direct" ? Math.round(distance / 800) : Math.round(distance / 700);
  const layoverHours = routeType === "connecting" ? Math.floor(Math.random() * 4) + 1 : 0;

  return {
    flying: `${flightDurationHours}h ${Math.floor(Math.random() * 60)}m`,
    total: `${flightDurationHours + layoverHours}h ${Math.floor(Math.random() * 60)}m`,
  };
};

const selectAirline = (origin: string, destination: string) => {
  if (origin === "BOG" || destination === "BOG") {
    const americasAirlines = airlines.filter((airline) => airline.region === "americas");
    if (Math.random() > 0.3) {
      return americasAirlines[Math.floor(Math.random() * americasAirlines.length)];
    }
  }

  return airlines[Math.floor(Math.random() * airlines.length)];
};

const shouldAllowHub = (hubCode: string, hasUsVisa: boolean) =>
  hasUsVisa || getCountryCodeFromAirport(hubCode) !== "US";

const generateStops = (origin: string, destination: string, hasUsVisa: boolean): Airport[] => {
  if (origin === destination) {
    return [];
  }

  const possibleHubs = [
    ...hubAirports.europe,
    ...hubAirports.americas,
    ...hubAirports.asia,
  ].filter((hubCode) => shouldAllowHub(hubCode, hasUsVisa));

  const numberOfStops = Math.random() > 0.7 ? 2 : 1;
  const usedHubs = new Set([origin, destination]);
  const stops: Airport[] = [];

  for (let index = 0; index < numberOfStops; index += 1) {
    const availableHubs = possibleHubs.filter((hubCode) => !usedHubs.has(hubCode));
    if (availableHubs.length === 0) {
      break;
    }

    const nextHub = availableHubs[Math.floor(Math.random() * availableHubs.length)];
    const airport = airports[nextHub];

    if (airport) {
      stops.push(airport);
      usedHubs.add(nextHub);
    }
  }

  return stops;
};

export const generateFlights = (
  origin: string,
  destination: string,
  routeType?: FlightRouteType,
  options: GenerateFlightsOptions = {}
): Flight[] => {
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
  const routeHasDirectFlights = hasDirectRoute(origin, destination);
  const departureDate = normalizeIsoDate(options.departureDate);
  const hasUsVisa = options.hasUsVisa ?? true;

  if ((routeType === "direct" || routeType === "both" || !routeType) && routeHasDirectFlights) {
    flights.push(
      ...generateFlightVariations(originAirport, destinationAirport, "direct", distance, departureDate, hasUsVisa)
    );
  }

  if (routeType === "connecting" || routeType === "both" || !routeType) {
    flights.push(
      ...generateFlightVariations(
        originAirport,
        destinationAirport,
        "connecting",
        distance,
        departureDate,
        hasUsVisa
      )
    );
  }

  return flights;
};

const generateFlightVariations = (
  origin: Airport,
  destination: Airport,
  routeType: Extract<FlightRouteType, "direct" | "connecting">,
  distance: number,
  departureDate: string,
  hasUsVisa: boolean
): Flight[] => {
  const flights: Flight[] = [];
  const numberOfFlights = routeType === "direct" ? Math.floor(Math.random() * 2) + 2 : Math.floor(Math.random() * 3) + 2;

  for (let index = 0; index < numberOfFlights; index += 1) {
    const airline = selectAirline(origin.code, destination.code);
    const prices = calculatePrice(distance, routeType);
    const duration = generateSchedule(distance, routeType);
    const stops = routeType === "connecting" ? generateStops(origin.code, destination.code, hasUsVisa) : [];
    const departureHour = routeType === "direct" ? [6, 10, 14, 18, 22][index % 5] : [8, 12, 16, 20][index % 4];
    const departureMinutes = [0, 15, 30, 45][index % 4];
    const nextDepartureDate = new Date(`${departureDate}T00:00:00`);
    nextDepartureDate.setDate(nextDepartureDate.getDate() + index);
    const currentDepartureDate = normalizeIsoDate(nextDepartureDate.toISOString().split("T")[0]);
    const departureTime = `${String(departureHour).padStart(2, "0")}:${String(departureMinutes).padStart(2, "0")}`;
    const schedule = buildScheduleFromDeparture({
      departureDate: currentDepartureDate,
      departureTime,
      totalDuration: duration.total,
      departureTimezone: "COT",
      arrivalTimezone: getDestinationTimezone(destination.code),
    });

    flights.push({
      id: `generated_${origin.code}_${destination.code}_${routeType}_${currentDepartureDate}_${index}`,
      airline: airline.name,
      airlineCode: airline.code,
      flightNumber: `${airline.code}${Math.floor(Math.random() * 900) + 100}`,
      route: {
        origin,
        destination,
        stops,
        duration,
        distance,
      },
      schedule: {
        departure: schedule.departure,
        arrival: schedule.arrival,
        layovers: stops.map((stop, stopIndex) => ({
          airport: stop,
          duration: generateLayoverDuration(stopIndex),
        })),
      },
      aircraft: getRealisticAircraft(distance),
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
            { code: "TX", name: "Airport Tax", amount: Math.round(prices.agency * 0.05) },
          ],
          fees: [
            { type: "booking", description: "Booking Fee", amount: Math.round(prices.agency * 0.03) },
            { type: "service", description: "Service Fee", amount: Math.round(prices.agency * 0.02) },
          ],
        },
      },
      availability: {
        seats: Math.floor(Math.random() * 15) + 5,
        cabinClass: "economy",
        bookingClass: ["Y", "M", "B", "T", "K"][Math.floor(Math.random() * 5)],
        refundable: Math.random() > 0.4,
        changeable: Math.random() > 0.2,
        lastUpdate: new Date().toISOString(),
      },
      services: {
        meals:
          routeType === "direct"
            ? ["Cena", "Desayuno"].slice(0, Math.floor(Math.random() * 2) + 1)
            : ["Desayuno", "Almuerzo", "Cena"].slice(0, Math.floor(Math.random() * 2) + 2),
        entertainment: true,
        wifi: Math.random() > 0.3,
        powerOutlets: Math.random() > 0.4,
        extraLegroom: Math.random() > 0.8,
      },
      baggage: {
        carry: { included: true, weight: "10kg", dimensions: "56x45x25cm" },
        checked: { included: true, weight: "23kg" },
      },
      restrictions: {
        minStay: Math.floor(Math.random() * 7) + 1,
        maxStay: Math.floor(Math.random() * 300) + 60,
        advancePurchase: Math.floor(Math.random() * 21) + 7,
        cancellationPolicy: Math.random() > 0.5 ? "Reembolsable con penalidad" : "No reembolsable",
        changePolicy: `Cambios: $${Math.floor(Math.random() * 200) + 50} USD + diferencia tarifaria`,
      },
    });
  }

  return flights;
};

const generateLayoverDuration = (index: number) => {
  const baseMinutes = index === 0 ? 120 : 90;
  const variation = Math.floor(Math.random() * 60) - 30;
  const totalMinutes = Math.max(60, baseMinutes + variation);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`.trim();
};

const getRealisticAircraft = (distance: number) => {
  const longHaulAircraft = ["Boeing 787-9", "Airbus A350-900", "Boeing 777-300ER"];
  const mediumHaulAircraft = ["Airbus A330-200", "Boeing 767-300", "Airbus A321"];

  if (distance > 8000) {
    return longHaulAircraft[Math.floor(Math.random() * longHaulAircraft.length)];
  }

  return mediumHaulAircraft[Math.floor(Math.random() * mediumHaulAircraft.length)];
};

const getDestinationTimezone = (airportCode: string) => {
  const timezones: Record<string, string> = {
    BOG: "COT",
    LHR: "GMT",
    CDG: "CET",
    MAD: "CET",
    BCN: "CET",
    TXL: "CET",
    AMS: "CET",
    MIA: "EST",
    YYZ: "EST",
    PEK: "CST",
    NRT: "JST",
    ICN: "KST",
    SIN: "SGT",
    DXB: "GST",
    SJO: "CST",
  };

  return timezones[airportCode] || "UTC";
};
