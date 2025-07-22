export interface CountryRequirement {
  country: string;
  countryCode: string;
  requirements: {
    type: 'visa' | 'visa-waiver' | 'passport' | 'transit-visa' | 'no-requirements';
    title: string;
    description: string;
    icon: string;
    urgency: 'high' | 'medium' | 'low';
    additionalInfo?: string[];
  }[];
}

const countryRequirements: Record<string, CountryRequirement> = {
  // Estados Unidos
  'US': {
    country: 'Estados Unidos',
    countryCode: 'US',
    requirements: [
      {
        type: 'visa',
        title: 'Visa americana requerida',
        description: 'Se requiere visa de turista (B1/B2) o ESTA',
        icon: '🇺🇸',
        urgency: 'high',
        additionalInfo: [
          'ESTA para ciudadanos de países VWP',
          'Visa B1/B2 para ciudadanos colombianos',
          'Pasaporte con vigencia mínima 6 meses'
        ]
      }
    ]
  },
  
  // España
  'ES': {
    country: 'España',
    countryCode: 'ES',
    requirements: [
      {
        type: 'passport',
        title: 'Pasaporte vigente',
        description: 'Solo se requiere pasaporte para estancias hasta 90 días',
        icon: '🇪🇸',
        urgency: 'low',
        additionalInfo: [
          'Pasaporte con vigencia mínima 3 meses',
          'Sin visa para turismo hasta 90 días',
          'Prueba de fondos económicos'
        ]
      }
    ]
  },

  // Reino Unido
  'GB': {
    country: 'Reino Unido',
    countryCode: 'GB',
    requirements: [
      {
        type: 'visa',
        title: 'Visa británica requerida',
        description: 'Se requiere visa de turista para ciudadanos colombianos',
        icon: '🇬🇧',
        urgency: 'high',
        additionalInfo: [
          'Visa de turista (Standard Visitor)',
          'Pasaporte con vigencia mínima 6 meses',
          'Prueba de fondos y alojamiento'
        ]
      }
    ]
  },

  // Emiratos Árabes Unidos
  'AE': {
    country: 'Emiratos Árabes Unidos',
    countryCode: 'AE',
    requirements: [
      {
        type: 'visa-waiver',
        title: 'Visa a la llegada',
        description: 'Visa gratuita a la llegada para ciudadanos colombianos',
        icon: '🇦🇪',
        urgency: 'low',
        additionalInfo: [
          'Visa gratuita por 90 días',
          'Pasaporte con vigencia mínima 6 meses',
          'Boleto de regreso confirmado'
        ]
      },
      {
        type: 'transit-visa',
        title: 'Tránsito permitido',
        description: 'Tránsito sin visa hasta 24 horas en el aeropuerto',
        icon: '✈️',
        urgency: 'low',
        additionalInfo: [
          'Solo para escalas en el aeropuerto',
          'No salir del área de tránsito',
          'Máximo 24 horas'
        ]
      }
    ]
  },

  // Francia
  'FR': {
    country: 'Francia',
    countryCode: 'FR',
    requirements: [
      {
        type: 'passport',
        title: 'Pasaporte vigente',
        description: 'Solo se requiere pasaporte para estancias hasta 90 días',
        icon: '🇫🇷',
        urgency: 'low',
        additionalInfo: [
          'Pasaporte con vigencia mínima 3 meses',
          'Sin visa para turismo hasta 90 días (Espacio Schengen)',
          'Prueba de fondos económicos'
        ]
      }
    ]
  },

  // Países Bajos
  'NL': {
    country: 'Países Bajos',
    countryCode: 'NL',
    requirements: [
      {
        type: 'passport',
        title: 'Pasaporte vigente',
        description: 'Solo se requiere pasaporte para estancias hasta 90 días',
        icon: '🇳🇱',
        urgency: 'low',
        additionalInfo: [
          'Pasaporte con vigencia mínima 3 meses',
          'Sin visa para turismo hasta 90 días (Espacio Schengen)',
          'Prueba de fondos económicos'
        ]
      },
      {
        type: 'transit-visa',
        title: 'Tránsito Schengen',
        description: 'Tránsito permitido en área internacional',
        icon: '✈️',
        urgency: 'low',
        additionalInfo: [
          'Tránsito sin visa en área internacional',
          'No salir del aeropuerto',
          'Boleto confirmado de conexión'
        ]
      }
    ]
  },

  // China
  'CN': {
    country: 'China',
    countryCode: 'CN',
    requirements: [
      {
        type: 'visa',
        title: 'Visa china requerida',
        description: 'Se requiere visa de turista para ciudadanos colombianos',
        icon: '🇨🇳',
        urgency: 'high',
        additionalInfo: [
          'Visa de turista (L) obligatoria',
          'Pasaporte con vigencia mínima 6 meses',
          'Invitación o itinerario detallado'
        ]
      },
      {
        type: 'transit-visa',
        title: 'Tránsito sin visa (24h)',
        description: 'Tránsito hasta 24 horas sin visa en algunas ciudades',
        icon: '⏰',
        urgency: 'medium',
        additionalInfo: [
          'Solo en aeropuertos específicos',
          'Máximo 24 horas',
          'Boleto confirmado de salida'
        ]
      }
    ]
  },

  // Colombia (para vuelos nacionales)
  'CO': {
    country: 'Colombia',
    countryCode: 'CO',
    requirements: [
      {
        type: 'no-requirements',
        title: 'Solo cédula colombiana',
        description: 'Para vuelos nacionales solo se requiere cédula',
        icon: '🇨🇴',
        urgency: 'low',
        additionalInfo: [
          'Cédula de ciudadanía vigente',
          'Menores: registro civil o tarjeta de identidad',
          'No se requieren documentos adicionales'
        ]
      }
    ]
  },

  // Alemania
  'DE': {
    country: 'Alemania',
    countryCode: 'DE',
    requirements: [
      {
        type: 'passport',
        title: 'Pasaporte vigente',
        description: 'Solo se requiere pasaporte para estancias hasta 90 días',
        icon: '🇩🇪',
        urgency: 'low',
        additionalInfo: [
          'Pasaporte con vigencia mínima 3 meses',
          'Sin visa para turismo hasta 90 días (Espacio Schengen)',
          'Prueba de fondos económicos'
        ]
      }
    ]
  },

  // Italia
  'IT': {
    country: 'Italia',
    countryCode: 'IT',
    requirements: [
      {
        type: 'passport',
        title: 'Pasaporte vigente',
        description: 'Solo se requiere pasaporte para estancias hasta 90 días',
        icon: '🇮🇹',
        urgency: 'low',
        additionalInfo: [
          'Pasaporte con vigencia mínima 3 meses',
          'Sin visa para turismo hasta 90 días (Espacio Schengen)',
          'Prueba de fondos económicos'
        ]
      }
    ]
  }
};

export const getCountryRequirements = (countryCode: string): CountryRequirement | null => {
  return countryRequirements[countryCode] || null;
};

export const getCountryRequirementsByName = (countryName: string): CountryRequirement | null => {
  const found = Object.values(countryRequirements).find(
    req => req.country.toLowerCase() === countryName.toLowerCase()
  );
  return found || null;
};

export const getTransitRequirements = (countryCode: string) => {
  const requirements = getCountryRequirements(countryCode);
  if (!requirements) return null;
  
  return requirements.requirements.filter(req => 
    req.type === 'transit-visa' || req.type === 'no-requirements'
  );
};

export const getVisaRequirements = (countryCode: string) => {
  const requirements = getCountryRequirements(countryCode);
  if (!requirements) return null;
  
  return requirements.requirements.filter(req => 
    req.type === 'visa' || req.type === 'visa-waiver' || req.type === 'passport'
  );
}; 