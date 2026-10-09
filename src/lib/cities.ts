export interface City {
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
}

// 131 cities covering major Muslim-majority regions, world capitals,
// and cities spanning all calculation method zones.
export const CITIES: City[] = [
  // North America (ISNA)
  { name: 'Toronto', country: 'Canada', countryCode: 'CA', lat: 43.65, lon: -79.38 },
  { name: 'Calgary', country: 'Canada', countryCode: 'CA', lat: 51.04, lon: -114.07 },
  { name: 'Montreal', country: 'Canada', countryCode: 'CA', lat: 45.50, lon: -73.57 },
  { name: 'Vancouver', country: 'Canada', countryCode: 'CA', lat: 49.28, lon: -123.12 },
  { name: 'Ottawa', country: 'Canada', countryCode: 'CA', lat: 45.42, lon: -75.70 },
  { name: 'Edmonton', country: 'Canada', countryCode: 'CA', lat: 53.55, lon: -113.49 },
  { name: 'New York', country: 'United States', countryCode: 'US', lat: 40.71, lon: -74.01 },
  { name: 'Los Angeles', country: 'United States', countryCode: 'US', lat: 34.05, lon: -118.24 },
  { name: 'Chicago', country: 'United States', countryCode: 'US', lat: 41.88, lon: -87.63 },
  { name: 'Houston', country: 'United States', countryCode: 'US', lat: 29.76, lon: -95.37 },
  { name: 'Dallas', country: 'United States', countryCode: 'US', lat: 32.78, lon: -96.80 },
  { name: 'Washington', country: 'United States', countryCode: 'US', lat: 38.91, lon: -77.04 },
  { name: 'Detroit', country: 'United States', countryCode: 'US', lat: 42.33, lon: -83.05 },
  { name: 'Philadelphia', country: 'United States', countryCode: 'US', lat: 39.95, lon: -75.17 },
  { name: 'Atlanta', country: 'United States', countryCode: 'US', lat: 33.75, lon: -84.39 },

  // Arabian Peninsula (Umm Al-Qura)
  { name: 'Makkah', country: 'Saudi Arabia', countryCode: 'SA', lat: 21.39, lon: 39.86 },
  { name: 'Madinah', country: 'Saudi Arabia', countryCode: 'SA', lat: 24.47, lon: 39.61 },
  { name: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA', lat: 24.71, lon: 46.67 },
  { name: 'Jeddah', country: 'Saudi Arabia', countryCode: 'SA', lat: 21.54, lon: 39.17 },
  { name: 'Dammam', country: 'Saudi Arabia', countryCode: 'SA', lat: 26.43, lon: 50.10 },

  // UAE (Dubai)
  { name: 'Dubai', country: 'UAE', countryCode: 'AE', lat: 25.20, lon: 55.27 },
  { name: 'Abu Dhabi', country: 'UAE', countryCode: 'AE', lat: 24.45, lon: 54.65 },
  { name: 'Sharjah', country: 'UAE', countryCode: 'AE', lat: 25.34, lon: 55.41 },

  // Kuwait
  { name: 'Kuwait City', country: 'Kuwait', countryCode: 'KW', lat: 29.38, lon: 47.99 },

  // Qatar
  { name: 'Doha', country: 'Qatar', countryCode: 'QA', lat: 25.29, lon: 51.53 },

  // Bahrain / Oman
  { name: 'Manama', country: 'Bahrain', countryCode: 'BH', lat: 26.23, lon: 50.59 },
  { name: 'Muscat', country: 'Oman', countryCode: 'OM', lat: 23.59, lon: 58.54 },

  // Egypt (Egyptian)
  { name: 'Cairo', country: 'Egypt', countryCode: 'EG', lat: 30.04, lon: 31.24 },
  { name: 'Alexandria', country: 'Egypt', countryCode: 'EG', lat: 31.20, lon: 29.92 },

  // Pakistan / India / Bangladesh (Karachi)
  { name: 'Karachi', country: 'Pakistan', countryCode: 'PK', lat: 24.86, lon: 67.01 },
  { name: 'Lahore', country: 'Pakistan', countryCode: 'PK', lat: 31.55, lon: 74.35 },
  { name: 'Islamabad', country: 'Pakistan', countryCode: 'PK', lat: 33.69, lon: 73.04 },
  { name: 'Peshawar', country: 'Pakistan', countryCode: 'PK', lat: 34.01, lon: 71.58 },
  { name: 'Faisalabad', country: 'Pakistan', countryCode: 'PK', lat: 31.42, lon: 73.08 },
  { name: 'Delhi', country: 'India', countryCode: 'IN', lat: 28.61, lon: 77.21 },
  { name: 'Mumbai', country: 'India', countryCode: 'IN', lat: 19.08, lon: 72.88 },
  { name: 'Hyderabad', country: 'India', countryCode: 'IN', lat: 17.38, lon: 78.49 },
  { name: 'Lucknow', country: 'India', countryCode: 'IN', lat: 26.85, lon: 80.95 },
  { name: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', lat: 23.81, lon: 90.41 },
  { name: 'Chittagong', country: 'Bangladesh', countryCode: 'BD', lat: 22.34, lon: 91.83 },

  // Turkey (Turkey)
  { name: 'Istanbul', country: 'Turkey', countryCode: 'TR', lat: 41.01, lon: 28.98 },
  { name: 'Ankara', country: 'Turkey', countryCode: 'TR', lat: 39.93, lon: 32.85 },
  { name: 'Izmir', country: 'Turkey', countryCode: 'TR', lat: 38.42, lon: 27.14 },
  { name: 'Bursa', country: 'Turkey', countryCode: 'TR', lat: 40.19, lon: 29.06 },

  // Iran (Tehran)
  { name: 'Tehran', country: 'Iran', countryCode: 'IR', lat: 35.69, lon: 51.39 },
  { name: 'Isfahan', country: 'Iran', countryCode: 'IR', lat: 32.65, lon: 51.68 },
  { name: 'Mashhad', country: 'Iran', countryCode: 'IR', lat: 36.30, lon: 59.61 },
  { name: 'Tabriz', country: 'Iran', countryCode: 'IR', lat: 38.08, lon: 46.29 },

  // Southeast Asia (Singapore)
  { name: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.35, lon: 103.82 },
  { name: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', lat: 3.14, lon: 101.69 },
  { name: 'Jakarta', country: 'Indonesia', countryCode: 'ID', lat: -6.21, lon: 106.85 },
  { name: 'Surabaya', country: 'Indonesia', countryCode: 'ID', lat: -7.25, lon: 112.75 },
  { name: 'Bandung', country: 'Indonesia', countryCode: 'ID', lat: -6.91, lon: 107.61 },
  { name: 'Medan', country: 'Indonesia', countryCode: 'ID', lat: 3.59, lon: 98.67 },
  { name: 'Manila', country: 'Philippines', countryCode: 'PH', lat: 14.60, lon: 120.98 },
  { name: 'Bangkok', country: 'Thailand', countryCode: 'TH', lat: 13.76, lon: 100.50 },

  // Africa (Egyptian / MWL)
  { name: 'Lagos', country: 'Nigeria', countryCode: 'NG', lat: 6.52, lon: 3.38 },
  { name: 'Abuja', country: 'Nigeria', countryCode: 'NG', lat: 9.06, lon: 7.49 },
  { name: 'Kano', country: 'Nigeria', countryCode: 'NG', lat: 12.00, lon: 8.52 },
  { name: 'Casablanca', country: 'Morocco', countryCode: 'MA', lat: 33.57, lon: -7.59 },
  { name: 'Rabat', country: 'Morocco', countryCode: 'MA', lat: 34.02, lon: -6.84 },
  { name: 'Tunis', country: 'Tunisia', countryCode: 'TN', lat: 36.81, lon: 10.18 },
  { name: 'Algiers', country: 'Algeria', countryCode: 'DZ', lat: 36.74, lon: 3.09 },
  { name: 'Tripoli', country: 'Libya', countryCode: 'LY', lat: 32.90, lon: 13.18 },
  { name: 'Khartoum', country: 'Sudan', countryCode: 'SD', lat: 15.50, lon: 32.56 },
  { name: 'Nairobi', country: 'Kenya', countryCode: 'KE', lat: -1.29, lon: 36.82 },
  { name: 'Dar es Salaam', country: 'Tanzania', countryCode: 'TZ', lat: -6.79, lon: 39.28 },
  { name: 'Addis Ababa', country: 'Ethiopia', countryCode: 'ET', lat: 9.02, lon: 38.75 },
  { name: 'Mogadishu', country: 'Somalia', countryCode: 'SO', lat: 2.05, lon: 45.32 },
  { name: 'Dakar', country: 'Senegal', countryCode: 'SN', lat: 14.69, lon: -17.44 },
  { name: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', lat: -26.20, lon: 28.05 },
  { name: 'Cape Town', country: 'South Africa', countryCode: 'ZA', lat: -33.93, lon: 18.42 },

  // Middle East / Levant
  { name: 'Baghdad', country: 'Iraq', countryCode: 'IQ', lat: 33.31, lon: 44.37 },
  { name: 'Erbil', country: 'Iraq', countryCode: 'IQ', lat: 36.19, lon: 44.01 },
  { name: 'Damascus', country: 'Syria', countryCode: 'SY', lat: 33.51, lon: 36.29 },
  { name: 'Aleppo', country: 'Syria', countryCode: 'SY', lat: 36.20, lon: 37.15 },
  { name: 'Amman', country: 'Jordan', countryCode: 'JO', lat: 31.95, lon: 35.93 },
  { name: 'Beirut', country: 'Lebanon', countryCode: 'LB', lat: 33.89, lon: 35.50 },
  { name: 'Jerusalem', country: 'Palestine', countryCode: 'PS', lat: 31.77, lon: 35.23 },
  { name: 'Gaza', country: 'Palestine', countryCode: 'PS', lat: 31.50, lon: 34.47 },
  { name: 'Sana\'a', country: 'Yemen', countryCode: 'YE', lat: 15.35, lon: 44.21 },

  // Central Asia
  { name: 'Kabul', country: 'Afghanistan', countryCode: 'AF', lat: 34.53, lon: 69.17 },
  { name: 'Tashkent', country: 'Uzbekistan', countryCode: 'UZ', lat: 41.30, lon: 69.28 },
  { name: 'Almaty', country: 'Kazakhstan', countryCode: 'KZ', lat: 43.24, lon: 76.95 },
  { name: 'Bishkek', country: 'Kyrgyzstan', countryCode: 'KG', lat: 42.87, lon: 74.59 },
  { name: 'Dushanbe', country: 'Tajikistan', countryCode: 'TJ', lat: 38.56, lon: 68.77 },
  { name: 'Baku', country: 'Azerbaijan', countryCode: 'AZ', lat: 40.41, lon: 49.87 },

  // Europe (MWL)
  { name: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.51, lon: -0.13 },
  { name: 'Birmingham', country: 'United Kingdom', countryCode: 'GB', lat: 52.49, lon: -1.90 },
  { name: 'Paris', country: 'France', countryCode: 'FR', lat: 48.86, lon: 2.35 },
  { name: 'Marseille', country: 'France', countryCode: 'FR', lat: 43.30, lon: 5.37 },
  { name: 'Berlin', country: 'Germany', countryCode: 'DE', lat: 52.52, lon: 13.41 },
  { name: 'Cologne', country: 'Germany', countryCode: 'DE', lat: 50.94, lon: 6.96 },
  { name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', lat: 52.37, lon: 4.90 },
  { name: 'Brussels', country: 'Belgium', countryCode: 'BE', lat: 50.85, lon: 4.35 },
  { name: 'Vienna', country: 'Austria', countryCode: 'AT', lat: 48.21, lon: 16.37 },
  { name: 'Stockholm', country: 'Sweden', countryCode: 'SE', lat: 59.33, lon: 18.07 },
  { name: 'Oslo', country: 'Norway', countryCode: 'NO', lat: 59.91, lon: 10.75 },
  { name: 'Copenhagen', country: 'Denmark', countryCode: 'DK', lat: 55.68, lon: 12.57 },
  { name: 'Helsinki', country: 'Finland', countryCode: 'FI', lat: 60.17, lon: 24.94 },
  { name: 'Rome', country: 'Italy', countryCode: 'IT', lat: 41.90, lon: 12.50 },
  { name: 'Milan', country: 'Italy', countryCode: 'IT', lat: 45.46, lon: 9.19 },
  { name: 'Madrid', country: 'Spain', countryCode: 'ES', lat: 40.42, lon: -3.70 },
  { name: 'Barcelona', country: 'Spain', countryCode: 'ES', lat: 41.39, lon: 2.17 },
  { name: 'Sarajevo', country: 'Bosnia', countryCode: 'BA', lat: 43.86, lon: 18.41 },
  { name: 'Tirana', country: 'Albania', countryCode: 'AL', lat: 41.33, lon: 19.82 },
  { name: 'Pristina', country: 'Kosovo', countryCode: 'XK', lat: 42.66, lon: 21.17 },
  { name: 'Moscow', country: 'Russia', countryCode: 'RU', lat: 55.76, lon: 37.62 },
  { name: 'Athens', country: 'Greece', countryCode: 'GR', lat: 37.98, lon: 23.73 },

  // East Asia / Oceania
  { name: 'Beijing', country: 'China', countryCode: 'CN', lat: 39.90, lon: 116.41 },
  { name: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.68, lon: 139.69 },
  { name: 'Seoul', country: 'South Korea', countryCode: 'KR', lat: 37.57, lon: 126.98 },
  { name: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.87, lon: 151.21 },
  { name: 'Melbourne', country: 'Australia', countryCode: 'AU', lat: -37.81, lon: 144.96 },
  { name: 'Auckland', country: 'New Zealand', countryCode: 'NZ', lat: -36.85, lon: 174.76 },

  // South America
  { name: 'Sao Paulo', country: 'Brazil', countryCode: 'BR', lat: -23.55, lon: -46.63 },
  { name: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', lat: -34.60, lon: -58.38 },
  { name: 'Bogota', country: 'Colombia', countryCode: 'CO', lat: 4.71, lon: -74.07 },
  { name: 'Lima', country: 'Peru', countryCode: 'PE', lat: -12.05, lon: -77.04 },
  { name: 'Paramaribo', country: 'Suriname', countryCode: 'SR', lat: 5.85, lon: -55.20 },
  { name: 'Georgetown', country: 'Guyana', countryCode: 'GY', lat: 6.80, lon: -58.16 },
  { name: 'Trinidad', country: 'Trinidad and Tobago', countryCode: 'TT', lat: 10.66, lon: -61.52 },

  // Caribbean / Central America
  { name: 'Mexico City', country: 'Mexico', countryCode: 'MX', lat: 19.43, lon: -99.13 },

  // Additional Muslim-majority cities
  { name: 'Colombo', country: 'Sri Lanka', countryCode: 'LK', lat: 6.93, lon: 79.85 },
  { name: 'Maldives', country: 'Maldives', countryCode: 'MV', lat: 4.18, lon: 73.51 },
  { name: 'Brunei', country: 'Brunei', countryCode: 'BN', lat: 4.94, lon: 114.95 },
  { name: 'Niamey', country: 'Niger', countryCode: 'NE', lat: 13.51, lon: 2.11 },
  { name: 'Bamako', country: 'Mali', countryCode: 'ML', lat: 12.64, lon: -8.00 },
  { name: 'Nouakchott', country: 'Mauritania', countryCode: 'MR', lat: 18.09, lon: -15.98 },
  { name: 'Conakry', country: 'Guinea', countryCode: 'GN', lat: 9.64, lon: -13.58 },
  { name: 'Djibouti', country: 'Djibouti', countryCode: 'DJ', lat: 11.59, lon: 43.15 },
];
