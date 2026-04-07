export type CabinClass = "economy" | "premium-economy" | "business" | "first";
export type TripType = "one-way" | "round-trip" | "multi-city";
export type FlightFlexibility = "exact" | "plus-minus-1" | "plus-minus-3";
export type FlightRouteType = "direct" | "connecting" | "both";

export interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  airlineLogo?: string;
  flightNumber: string;
  route: FlightRoute;
  schedule: FlightSchedule;
  aircraft: string;
  pricing: FlightPricing;
  availability: FlightAvailability;
  services: FlightServices;
  baggage: BaggageInfo;
  restrictions: FlightRestrictions;
}

export interface FlightRoute {
  origin: Airport;
  destination: Airport;
  stops: Airport[];
  duration: {
    total: string;
    flying: string;
  };
  distance: number;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  terminal?: string;
}

export interface FlightSchedule {
  departure: {
    date: string;
    time: string;
    timezone: string;
  };
  arrival: {
    date: string;
    time: string;
    timezone: string;
  };
  layovers?: Layover[];
}

export interface Layover {
  airport: Airport;
  duration: string;
  aircraft?: string;
}

export interface FlightPricing {
  currency: string;
  publicPrice: number;
  agencyPrice: number;
  discount: number;
  taxes: number;
  fees: number;
  total: number;
  priceBreakdown: {
    baseFare: number;
    taxes: PriceTax[];
    fees: PriceFee[];
  };
}

export interface PriceTax {
  code: string;
  name: string;
  amount: number;
}

export interface PriceFee {
  type: string;
  description: string;
  amount: number;
}

export interface FlightAvailability {
  seats: number;
  cabinClass: CabinClass;
  bookingClass: string;
  refundable: boolean;
  changeable: boolean;
  lastUpdate: string;
}

export interface FlightServices {
  meals: string[];
  entertainment: boolean;
  wifi: boolean;
  powerOutlets: boolean;
  extraLegroom: boolean;
}

export interface BaggageInfo {
  carry: {
    included: boolean;
    weight: string;
    dimensions: string;
  };
  checked: {
    included: boolean;
    weight: string;
    additionalFee?: number;
  };
}

export interface FlightRestrictions {
  minStay?: number;
  maxStay?: number;
  advancePurchase?: number;
  cancellationPolicy: string;
  changePolicy: string;
}

export interface FlightSearchCriteria {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass: CabinClass;
  tripType: TripType;
  flexibility?: FlightFlexibility;
  routeType?: FlightRouteType;
  hasUsVisa?: boolean;
}

export interface FlightRouteOption {
  type: Extract<FlightRouteType, "direct" | "connecting">;
  label: string;
  description: string;
  available: boolean;
  estimatedPrice?: {
    min: number;
    max: number;
  };
}

export interface FlightCart {
  outbound?: Flight;
  return?: Flight;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  totalPrice: number;
  currency: string;
}

export interface RouteInfo {
  options: FlightRouteOption[];
  visaRequirements: string[];
  hasDirectFlights: boolean;
  totalOptions: number;
}
