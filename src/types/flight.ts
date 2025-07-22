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
    total: string; // "14h 30m"
    flying: string; // "12h 45m"
  };
  distance: number; // km
}

export interface Airport {
  code: string; // "BOG"
  name: string; // "El Dorado International Airport"
  city: string; // "Bogotá"
  country: string; // "Colombia"
  terminal?: string;
}

export interface FlightSchedule {
  departure: {
    date: string; // "2024-12-15"
    time: string; // "14:30"
    timezone: string; // "COT"
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
  duration: string; // "2h 15m"
  aircraft?: string;
}

export interface FlightPricing {
  currency: string;
  publicPrice: number;
  agencyPrice: number; // Precio B2B
  discount: number; // Porcentaje de descuento
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
  cabinClass: 'economy' | 'premium-economy' | 'business' | 'first';
  bookingClass: string; // "Y", "M", "B", etc.
  refundable: boolean;
  changeable: boolean;
  lastUpdate: string;
}

export interface FlightServices {
  meals: string[]; // ["Breakfast", "Lunch"]
  entertainment: boolean;
  wifi: boolean;
  powerOutlets: boolean;
  extraLegroom: boolean;
}

export interface BaggageInfo {
  carry: {
    included: boolean;
    weight: string; // "8kg"
    dimensions: string; // "55x40x20cm"
  };
  checked: {
    included: boolean;
    weight: string; // "23kg"
    additionalFee?: number;
  };
}

export interface FlightRestrictions {
  minStay?: number; // días
  maxStay?: number; // días
  advancePurchase?: number; // días
  cancellationPolicy: string;
  changePolicy: string;
}

export interface FlightSearchCriteria {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string; // Para vuelos redondos
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass: 'economy' | 'premium-economy' | 'business' | 'first';
  tripType: 'one-way' | 'round-trip' | 'multi-city';
  flexibility?: 'exact' | 'plus-minus-1' | 'plus-minus-3';
  routeType?: 'direct' | 'connecting' | 'both'; // Nuevo campo para tipo de ruta
}

export interface FlightRouteOption {
  type: 'direct' | 'connecting';
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