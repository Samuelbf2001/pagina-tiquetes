export interface Program {
  id: string;
  name: string;
  destination: string;
  country: string;
  duration: number; // in weeks
  durationUnit: 'weeks' | 'months';
  hoursPerWeek: number;
  type: 'language' | 'university' | 'internship' | 'volunteer' | 'professional';
  startDates: string[];
  requirements: string[];
  availableSpots: number;
  priceUSD: number;
  priceLocal: number;
  localCurrency: string;
  description: string;
  highlights: string[];
  imageUrl?: string;
  school?: {
    name: string;
    accreditation: string[];
    rating: number;
  };
  visaRequired: boolean;
  ageRange: {
    min: number;
    max: number;
  };
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
}