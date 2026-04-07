import type { Airport, Flight, FlightSearchCriteria } from "@/types/flight";
import { generateFlights } from "@/utils/flightGenerator";
import { getCountryCodeFromAirport } from "@/utils/airportCountryMapping";
import {
  buildScheduleFromDeparture,
  formatDateToIso,
  normalizeIsoDate,
} from "@/utils/dateUtils";

const airports: Record<string, Airport> = {
  BOG: { code: "BOG", name: "El Dorado International Airport", city: "Bogota", country: "Colombia" },
  MDE: { code: "MDE", name: "Jose Maria Cordova", city: "Medellin", country: "Colombia" },
  LHR: { code: "LHR", name: "Heathrow Airport", city: "Londres", country: "Reino Unido", terminal: "Terminal 5" },
  CDG: { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "Francia", terminal: "Terminal 2E" },
  MAD: { code: "MAD", name: "Adolfo Suarez Madrid-Barajas", city: "Madrid", country: "Espana", terminal: "Terminal 4" },
  MIA: { code: "MIA", name: "Miami International Airport", city: "Miami", country: "Estados Unidos", terminal: "Terminal J" },
  AMS: { code: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Paises Bajos" },
  PEK: { code: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China", terminal: "Terminal 3" },
};

export const mockFlights: Flight[] = [
  {
    id: "flight_bog_lhr_connecting",
    airline: "British Airways",
    airlineCode: "BA",
    flightNumber: "BA2237",
    route: {
      origin: airports.BOG,
      destination: airports.LHR,
      stops: [airports.MAD],
      duration: { total: "14h 25m", flying: "12h 10m" },
      distance: 8544,
    },
    schedule: {
      departure: { date: "2024-08-05", time: "23:45", timezone: "COT" },
      arrival: { date: "2024-08-06", time: "14:10", timezone: "GMT" },
      layovers: [{ airport: airports.MAD, duration: "2h 15m" }],
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
          { code: "GB", name: "UK Air Passenger Duty", amount: 60 },
        ],
        fees: [
          { type: "booking", description: "Booking Fee", amount: 25 },
          { type: "service", description: "Service Fee", amount: 20 },
        ],
      },
    },
    availability: {
      seats: 8,
      cabinClass: "economy",
      bookingClass: "M",
      refundable: false,
      changeable: true,
      lastUpdate: "2024-01-15T10:30:00Z",
    },
    services: {
      meals: ["Cena", "Desayuno"],
      entertainment: true,
      wifi: true,
      powerOutlets: true,
      extraLegroom: false,
    },
    baggage: {
      carry: { included: true, weight: "8kg", dimensions: "56x45x25cm" },
      checked: { included: true, weight: "23kg" },
    },
    restrictions: {
      minStay: 7,
      maxStay: 365,
      advancePurchase: 14,
      cancellationPolicy: "Cambios permitidos con tarifa",
      changePolicy: "Cambios: $150 USD + diferencia tarifaria",
    },
  },
  {
    id: "flight_bog_cdg_direct",
    airline: "Air France",
    airlineCode: "AF",
    flightNumber: "AF422",
    route: {
      origin: airports.BOG,
      destination: airports.CDG,
      stops: [],
      duration: { total: "10h 45m", flying: "10h 45m" },
      distance: 8498,
    },
    schedule: {
      departure: { date: "2024-09-02", time: "22:30", timezone: "COT" },
      arrival: { date: "2024-09-03", time: "09:15", timezone: "CET" },
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
          { code: "FR", name: "France Solidarity Tax", amount: 70 },
        ],
        fees: [
          { type: "booking", description: "Booking Fee", amount: 25 },
          { type: "service", description: "Service Fee", amount: 15 },
        ],
      },
    },
    availability: {
      seats: 12,
      cabinClass: "economy",
      bookingClass: "Y",
      refundable: true,
      changeable: true,
      lastUpdate: "2024-01-15T10:30:00Z",
    },
    services: {
      meals: ["Cena", "Desayuno"],
      entertainment: true,
      wifi: true,
      powerOutlets: true,
      extraLegroom: false,
    },
    baggage: {
      carry: { included: true, weight: "12kg", dimensions: "55x35x25cm" },
      checked: { included: true, weight: "23kg" },
    },
    restrictions: {
      minStay: 7,
      maxStay: 365,
      advancePurchase: 21,
      cancellationPolicy: "Reembolsable con penalidad",
      changePolicy: "Cambios: $100 USD + diferencia tarifaria",
    },
  },
  {
    id: "flight_bog_pek_connecting",
    airline: "Air China",
    airlineCode: "CA",
    flightNumber: "CA908",
    route: {
      origin: airports.BOG,
      destination: airports.PEK,
      stops: [airports.MAD, airports.AMS],
      duration: { total: "24h 30m", flying: "19h 15m" },
      distance: 17854,
    },
    schedule: {
      departure: { date: "2024-08-20", time: "14:30", timezone: "COT" },
      arrival: { date: "2024-08-21", time: "15:00", timezone: "CST" },
      layovers: [
        { airport: airports.MAD, duration: "3h 45m" },
        { airport: airports.AMS, duration: "1h 30m" },
      ],
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
          { code: "CN", name: "China Airport Tax", amount: 140 },
        ],
        fees: [
          { type: "booking", description: "Booking Fee", amount: 45 },
          { type: "service", description: "Service Fee", amount: 40 },
        ],
      },
    },
    availability: {
      seats: 4,
      cabinClass: "economy",
      bookingClass: "T",
      refundable: false,
      changeable: true,
      lastUpdate: "2024-01-15T10:30:00Z",
    },
    services: {
      meals: ["Almuerzo", "Cena", "Desayuno"],
      entertainment: true,
      wifi: true,
      powerOutlets: true,
      extraLegroom: false,
    },
    baggage: {
      carry: { included: true, weight: "10kg", dimensions: "56x45x25cm" },
      checked: { included: true, weight: "23kg" },
    },
    restrictions: {
      minStay: 7,
      maxStay: 90,
      advancePurchase: 21,
      cancellationPolicy: "No reembolsable",
      changePolicy: "Cambios: $200 USD + diferencia tarifaria",
    },
  },
  {
    id: "flight_bog_mad_direct",
    airline: "Avianca",
    airlineCode: "AV",
    flightNumber: "AV027",
    route: {
      origin: airports.BOG,
      destination: airports.MAD,
      stops: [],
      duration: { total: "9h 30m", flying: "9h 30m" },
      distance: 8048,
    },
    schedule: {
      departure: { date: "2024-08-15", time: "23:55", timezone: "COT" },
      arrival: { date: "2024-08-16", time: "09:25", timezone: "CET" },
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
          { code: "ES", name: "Spain Airport Tax", amount: 70 },
        ],
        fees: [
          { type: "booking", description: "Booking Fee", amount: 35 },
          { type: "service", description: "Service Fee", amount: 20 },
        ],
      },
    },
    availability: {
      seats: 18,
      cabinClass: "economy",
      bookingClass: "Y",
      refundable: true,
      changeable: true,
      lastUpdate: "2024-01-15T10:30:00Z",
    },
    services: {
      meals: ["Cena", "Desayuno"],
      entertainment: true,
      wifi: true,
      powerOutlets: true,
      extraLegroom: false,
    },
    baggage: {
      carry: { included: true, weight: "10kg", dimensions: "56x45x25cm" },
      checked: { included: true, weight: "23kg" },
    },
    restrictions: {
      minStay: 7,
      maxStay: 365,
      advancePurchase: 14,
      cancellationPolicy: "Reembolsable con penalidad de $150",
      changePolicy: "Cambios: $100 USD + diferencia tarifaria",
    },
  },
  {
    id: "flight_bog_mde_direct",
    airline: "Avianca",
    airlineCode: "AV",
    flightNumber: "AV9312",
    route: {
      origin: airports.BOG,
      destination: airports.MDE,
      stops: [],
      duration: { total: "1h 00m", flying: "1h 00m" },
      distance: 215,
    },
    schedule: {
      departure: { date: "2024-08-18", time: "07:30", timezone: "COT" },
      arrival: { date: "2024-08-18", time: "08:30", timezone: "COT" },
    },
    aircraft: "Airbus A320",
    pricing: {
      currency: "COP",
      publicPrice: 420000,
      agencyPrice: 325000,
      discount: 23,
      taxes: 54000,
      fees: 19000,
      total: 398000,
      priceBreakdown: {
        baseFare: 325000,
        taxes: [
          { code: "CO", name: "Airport Tax", amount: 39000 },
          { code: "YQ", name: "Fuel Surcharge", amount: 15000 },
        ],
        fees: [{ type: "service", description: "Service Fee", amount: 19000 }],
      },
    },
    availability: {
      seats: 9,
      cabinClass: "economy",
      bookingClass: "L",
      refundable: false,
      changeable: true,
      lastUpdate: "2024-01-15T10:30:00Z",
    },
    services: {
      meals: [],
      entertainment: false,
      wifi: false,
      powerOutlets: false,
      extraLegroom: false,
    },
    baggage: {
      carry: { included: true, weight: "10kg", dimensions: "55x35x25cm" },
      checked: { included: false, weight: "0kg", additionalFee: 90000 },
    },
    restrictions: {
      minStay: 1,
      maxStay: 30,
      advancePurchase: 3,
      cancellationPolicy: "No reembolsable",
      changePolicy: "Cambios con penalidad y diferencia tarifaria",
    },
  },
];

const remapFlightToDepartureDate = (flight: Flight, departureDate: string, dayOffset: number): Flight => {
  const nextDate = new Date(`${normalizeIsoDate(departureDate)}T00:00:00`);
  nextDate.setDate(nextDate.getDate() + dayOffset);
  const nextDepartureDate = formatDateToIso(nextDate);
  const nextSchedule = buildScheduleFromDeparture({
    departureDate: nextDepartureDate,
    departureTime: flight.schedule.departure.time,
    totalDuration: flight.route.duration.total,
    departureTimezone: flight.schedule.departure.timezone,
    arrivalTimezone: flight.schedule.arrival.timezone,
  });

  return {
    ...flight,
    id: `${flight.id}_${nextDepartureDate}_${dayOffset}`,
    schedule: {
      departure: nextSchedule.departure,
      arrival: nextSchedule.arrival,
      layovers: flight.schedule.layovers,
    },
    availability: {
      ...flight.availability,
      lastUpdate: new Date().toISOString(),
    },
  };
};

const hasUsLayover = (flight: Flight) =>
  (flight.schedule.layovers ?? []).some(
    (layover) => getCountryCodeFromAirport(layover.airport.code) === "US"
  );

const meetsVisaRules = (flight: Flight, criteria: FlightSearchCriteria) => {
  if (criteria.hasUsVisa !== false) {
    return true;
  }

  return (
    getCountryCodeFromAirport(flight.route.destination.code) !== "US" &&
    !hasUsLayover(flight)
  );
};

const sortFlights = (flights: Flight[]) =>
  [...flights].sort((leftFlight, rightFlight) => {
    const stopsDifference = leftFlight.route.stops.length - rightFlight.route.stops.length;
    if (stopsDifference !== 0) {
      return stopsDifference;
    }

    return leftFlight.pricing.agencyPrice - rightFlight.pricing.agencyPrice;
  });

const dedupeFlights = (flights: Flight[]) => {
  const seenFlightIds = new Set<string>();

  return flights.filter((flight) => {
    if (seenFlightIds.has(flight.id)) {
      return false;
    }

    seenFlightIds.add(flight.id);
    return true;
  });
};

const searchFlightsInternal = (criteria: FlightSearchCriteria) => {
  if (!criteria.origin || !criteria.destination || criteria.origin === criteria.destination) {
    return [];
  }

  if (criteria.hasUsVisa === false && getCountryCodeFromAirport(criteria.destination) === "US") {
    return [];
  }

  const normalizedDepartureDate = normalizeIsoDate(criteria.departureDate);
  const matchingPredefinedFlights = mockFlights
    .filter((flight) => {
      if (criteria.origin && flight.route.origin.code !== criteria.origin) return false;
      if (criteria.destination && flight.route.destination.code !== criteria.destination) return false;
      return true;
    })
    .map((flight, index) => remapFlightToDepartureDate(flight, normalizedDepartureDate, index));

  const generatedFlights = generateFlights(criteria.origin, criteria.destination, criteria.routeType, {
    departureDate: normalizedDepartureDate,
    hasUsVisa: criteria.hasUsVisa,
  });

  const flightsByRouteType = [...matchingPredefinedFlights, ...generatedFlights].filter((flight) => {
    if (criteria.routeType === "direct") {
      return flight.route.stops.length === 0;
    }

    if (criteria.routeType === "connecting") {
      return flight.route.stops.length > 0;
    }

    return true;
  });

  return sortFlights(
    dedupeFlights(flightsByRouteType).filter((flight) => meetsVisaRules(flight, criteria))
  );
};

export const searchFlights = (criteria: FlightSearchCriteria) => searchFlightsInternal(criteria);

export const searchFlightsWithMinimumResults = (
  criteria: FlightSearchCriteria,
  minimumResults = 20
) => {
  const normalizedBaseDate = normalizeIsoDate(criteria.departureDate);
  const aggregatedFlights: Flight[] = [];
  const seenFlightIds = new Set<string>();
  let offsetDays = 0;

  while (aggregatedFlights.length < minimumResults && offsetDays < 30) {
    const nextDate = new Date(`${normalizedBaseDate}T00:00:00`);
    nextDate.setDate(nextDate.getDate() + offsetDays);

    const nextCriteria: FlightSearchCriteria = {
      ...criteria,
      departureDate: formatDateToIso(nextDate),
    };

    const nextFlights = searchFlightsInternal(nextCriteria);

    nextFlights.forEach((flight) => {
      if (!seenFlightIds.has(flight.id)) {
        seenFlightIds.add(flight.id);
        aggregatedFlights.push(flight);
      }
    });

    offsetDays += 1;
  }

  return sortFlights(aggregatedFlights).slice(0, Math.max(minimumResults, aggregatedFlights.length));
};
