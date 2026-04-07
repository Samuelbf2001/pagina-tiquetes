// Mapeo de códigos de aeropuerto a códigos de país
export const airportToCountry: Record<string, string> = {
  // Colombia
  'BOG': 'CO', // Bogotá
  'MDE': 'CO', // Medellín
  'CTG': 'CO', // Cartagena
  'CLO': 'CO', // Cali
  'BAQ': 'CO', // Barranquilla
  'BGA': 'CO', // Bucaramanga
  'SMR': 'CO', // Santa Marta
  'PEI': 'CO', // Pereira
  'VVC': 'CO', // Villavicencio
  'ADZ': 'CO', // San Andrés
  'CUC': 'CO', // Cúcuta

  // Estados Unidos
  'JFK': 'US', // Nueva York
  'LAX': 'US', // Los Ángeles
  'MIA': 'US', // Miami
  'DFW': 'US', // Dallas
  'ORD': 'US', // Chicago
  'SFO': 'US', // San Francisco
  'LAS': 'US', // Las Vegas
  'SEA': 'US', // Seattle
  'BOS': 'US', // Boston
  'ATL': 'US', // Atlanta

  // España
  'MAD': 'ES', // Madrid
  'BCN': 'ES', // Barcelona
  'PMI': 'ES', // Palma de Mallorca
  'LPA': 'ES', // Las Palmas
  'SVQ': 'ES', // Sevilla
  'VLC': 'ES', // Valencia
  'BIO': 'ES', // Bilbao

  // Reino Unido
  'LHR': 'GB', // Londres Heathrow
  'LGW': 'GB', // Londres Gatwick
  'STN': 'GB', // Londres Stansted
  'LTN': 'GB', // Londres Luton
  'MAN': 'GB', // Manchester
  'EDI': 'GB', // Edimburgo
  'GLA': 'GB', // Glasgow

  // Emiratos Árabes Unidos
  'DXB': 'AE', // Dubái
  'AUH': 'AE', // Abu Dhabi
  'SHJ': 'AE', // Sharjah

  // Francia
  'CDG': 'FR', // París Charles de Gaulle
  'ORY': 'FR', // París Orly
  'NCE': 'FR', // Niza
  'LYS': 'FR', // Lyon
  'MRS': 'FR', // Marsella
  'TLS': 'FR', // Toulouse

  // Países Bajos
  'AMS': 'NL', // Amsterdam
  'EIN': 'NL', // Eindhoven
  'RTM': 'NL', // Rotterdam

  // China
  'PEK': 'CN', // Beijing
  'PVG': 'CN', // Shanghai Pudong
  'SHA': 'CN', // Shanghai Hongqiao
  'CAN': 'CN', // Guangzhou
  'CTU': 'CN', // Chengdu
  'XIY': 'CN', // Xi'an
  'KMG': 'CN', // Kunming

  // Alemania
  'FRA': 'DE', // Frankfurt
  'MUC': 'DE', // Munich
  'DUS': 'DE', // Düsseldorf
  'TXL': 'DE', // Berlín Tegel
  'SXF': 'DE', // Berlín Schönefeld
  'BER': 'DE', // Berlín Brandenburg
  'HAM': 'DE', // Hamburgo
  'STR': 'DE', // Stuttgart

  // Italia
  'FCO': 'IT', // Roma Fiumicino
  'CIA': 'IT', // Roma Ciampino
  'MXP': 'IT', // Milán Malpensa
  'LIN': 'IT', // Milán Linate
  'NAP': 'IT', // Nápoles
  'VCE': 'IT', // Venecia
  'FLR': 'IT', // Florencia
  'BOL': 'IT', // Bolonia

  // Otros países importantes
  'ZUR': 'CH', // Zurich, Suiza
  'VIE': 'AT', // Viena, Austria
  'CPH': 'DK', // Copenhague, Dinamarca
  'ARN': 'SE', // Estocolmo, Suecia
  'OSL': 'NO', // Oslo, Noruega
  'HEL': 'FI', // Helsinki, Finlandia
  'WAW': 'PL', // Varsovia, Polonia
  'PRG': 'CZ', // Praga, República Checa
  'BUD': 'HU', // Budapest, Hungría
  'OTP': 'RO', // Bucarest, Rumania
  'SOF': 'BG', // Sofía, Bulgaria
  'ATH': 'GR', // Atenas, Grecia
  'IST': 'TR', // Estambul, Turquía
  'SVO': 'RU', // Moscú, Rusia
  'LED': 'RU', // San Petersburgo, Rusia

  // América Latina
  'LIM': 'PE', // Lima, Perú
  'SCL': 'CL', // Santiago, Chile
  'EZE': 'AR', // Buenos Aires, Argentina
  'GRU': 'BR', // São Paulo, Brasil
  'GIG': 'BR', // Río de Janeiro, Brasil
  'UIO': 'EC', // Quito, Ecuador
  'GYE': 'EC', // Guayaquil, Ecuador
  'PTY': 'PA', // Ciudad de Panamá, Panamá
  'SJO': 'CR', // San José, Costa Rica
  'SAL': 'SV', // San Salvador, El Salvador
  'MEX': 'MX', // Ciudad de México, México
  'CUN': 'MX', // Cancún, México

  // Asia-Pacífico
  'NRT': 'JP', // Tokio Narita, Japón
  'HND': 'JP', // Tokio Haneda, Japón
  'ICN': 'KR', // Seúl, Corea del Sur
  'SIN': 'SG', // Singapur
  'BKK': 'TH', // Bangkok, Tailandia
  'KUL': 'MY', // Kuala Lumpur, Malasia
  'CGK': 'ID', // Yakarta, Indonesia
  'MNL': 'PH', // Manila, Filipinas
  'HKG': 'HK', // Hong Kong
  'TPE': 'TW', // Taipei, Taiwán
  'SYD': 'AU', // Sídney, Australia
  'MEL': 'AU', // Melbourne, Australia
  'AKL': 'NZ', // Auckland, Nueva Zelanda

  // África y Medio Oriente
  'CAI': 'EG', // El Cairo, Egipto
  'JNB': 'ZA', // Johannesburgo, Sudáfrica
  'CPT': 'ZA', // Ciudad del Cabo, Sudáfrica
  'CMN': 'MA', // Casablanca, Marruecos
  'DOH': 'QA', // Doha, Qatar
  'KWI': 'KW', // Kuwait City, Kuwait
  'RUH': 'SA', // Riad, Arabia Saudí
  'JED': 'SA', // Jeddah, Arabia Saudí
  'TLV': 'IL', // Tel Aviv, Israel
  'AMM': 'JO', // Amman, Jordania
  'BEY': 'LB', // Beirut, Líbano
};

export const getCountryCodeFromAirport = (airportCode: string): string | null => {
  return airportToCountry[airportCode] || null;
};

export const getCountryCodesFromRoute = (origin: string, destination: string, layovers?: Array<{ airport: { code: string } }>): string[] => {
  const countries = new Set<string>();
  
  // País de destino (si se proporciona)
  if (destination) {
    const destinationCountry = getCountryCodeFromAirport(destination);
    if (destinationCountry) {
      countries.add(destinationCountry);
    }
  }
  
  // Países de escalas
  if (layovers && layovers.length > 0) {
    layovers.forEach(layover => {
      const layoverCountry = getCountryCodeFromAirport(layover.airport.code);
      if (layoverCountry) {
        countries.add(layoverCountry);
      }
    });
  }
  
  return Array.from(countries);
};

// Función auxiliar para obtener el país de un aeropuerto específico
export const getCountryFromAirport = (airportCode: string): string | null => {
  return getCountryCodeFromAirport(airportCode);
}; 
