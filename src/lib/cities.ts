export interface City {
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  timezone: string;
}

// ~150 cities covering major Muslim-majority regions, world capitals,
// and cities spanning all calculation method zones.
export const CITIES: City[] = [
  // North America (ISNA)
  { name: 'Toronto', country: 'Canada', countryCode: 'CA', lat: 43.65, lon: -79.38, timezone: 'America/Toronto' },
  { name: 'Calgary', country: 'Canada', countryCode: 'CA', lat: 51.04, lon: -114.07, timezone: 'America/Edmonton' },
  { name: 'Montreal', country: 'Canada', countryCode: 'CA', lat: 45.50, lon: -73.57, timezone: 'America/Toronto' },
  { name: 'Vancouver', country: 'Canada', countryCode: 'CA', lat: 49.28, lon: -123.12, timezone: 'America/Vancouver' },
  { name: 'Ottawa', country: 'Canada', countryCode: 'CA', lat: 45.42, lon: -75.70, timezone: 'America/Toronto' },
  { name: 'Edmonton', country: 'Canada', countryCode: 'CA', lat: 53.55, lon: -113.49, timezone: 'America/Edmonton' },
  { name: 'New York', country: 'United States', countryCode: 'US', lat: 40.71, lon: -74.01, timezone: 'America/New_York' },
  { name: 'Los Angeles', country: 'United States', countryCode: 'US', lat: 34.05, lon: -118.24, timezone: 'America/Los_Angeles' },
  { name: 'Chicago', country: 'United States', countryCode: 'US', lat: 41.88, lon: -87.63, timezone: 'America/Chicago' },
  { name: 'Houston', country: 'United States', countryCode: 'US', lat: 29.76, lon: -95.37, timezone: 'America/Chicago' },
  { name: 'Dallas', country: 'United States', countryCode: 'US', lat: 32.78, lon: -96.80, timezone: 'America/Chicago' },
  { name: 'Washington', country: 'United States', countryCode: 'US', lat: 38.91, lon: -77.04, timezone: 'America/New_York' },
  { name: 'Detroit', country: 'United States', countryCode: 'US', lat: 42.33, lon: -83.05, timezone: 'America/Detroit' },
  { name: 'Philadelphia', country: 'United States', countryCode: 'US', lat: 39.95, lon: -75.17, timezone: 'America/New_York' },
  { name: 'Atlanta', country: 'United States', countryCode: 'US', lat: 33.75, lon: -84.39, timezone: 'America/New_York' },

  // Arabian Peninsula (Umm Al-Qura)
  { name: 'Makkah', country: 'Saudi Arabia', countryCode: 'SA', lat: 21.39, lon: 39.86, timezone: 'Asia/Riyadh' },
  { name: 'Madinah', country: 'Saudi Arabia', countryCode: 'SA', lat: 24.47, lon: 39.61, timezone: 'Asia/Riyadh' },
  { name: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA', lat: 24.71, lon: 46.67, timezone: 'Asia/Riyadh' },
  { name: 'Jeddah', country: 'Saudi Arabia', countryCode: 'SA', lat: 21.54, lon: 39.17, timezone: 'Asia/Riyadh' },
  { name: 'Dammam', country: 'Saudi Arabia', countryCode: 'SA', lat: 26.43, lon: 50.10, timezone: 'Asia/Riyadh' },

  // UAE (Dubai)
  { name: 'Dubai', country: 'UAE', countryCode: 'AE', lat: 25.20, lon: 55.27, timezone: 'Asia/Dubai' },
  { name: 'Abu Dhabi', country: 'UAE', countryCode: 'AE', lat: 24.45, lon: 54.65, timezone: 'Asia/Dubai' },
  { name: 'Sharjah', country: 'UAE', countryCode: 'AE', lat: 25.34, lon: 55.41, timezone: 'Asia/Dubai' },

  // Kuwait
  { name: 'Kuwait City', country: 'Kuwait', countryCode: 'KW', lat: 29.38, lon: 47.99, timezone: 'Asia/Kuwait' },

  // Qatar
  { name: 'Doha', country: 'Qatar', countryCode: 'QA', lat: 25.29, lon: 51.53, timezone: 'Asia/Qatar' },

  // Bahrain / Oman
  { name: 'Manama', country: 'Bahrain', countryCode: 'BH', lat: 26.23, lon: 50.59, timezone: 'Asia/Bahrain' },
  { name: 'Muscat', country: 'Oman', countryCode: 'OM', lat: 23.59, lon: 58.54, timezone: 'Asia/Muscat' },

  // Egypt (Egyptian)
  { name: 'Cairo', country: 'Egypt', countryCode: 'EG', lat: 30.04, lon: 31.24, timezone: 'Africa/Cairo' },
  { name: 'Alexandria', country: 'Egypt', countryCode: 'EG', lat: 31.20, lon: 29.92, timezone: 'Africa/Cairo' },

  // Pakistan / India / Bangladesh (Karachi)
  { name: 'Karachi', country: 'Pakistan', countryCode: 'PK', lat: 24.86, lon: 67.01, timezone: 'Asia/Karachi' },
  { name: 'Lahore', country: 'Pakistan', countryCode: 'PK', lat: 31.55, lon: 74.35, timezone: 'Asia/Karachi' },
  { name: 'Islamabad', country: 'Pakistan', countryCode: 'PK', lat: 33.69, lon: 73.04, timezone: 'Asia/Karachi' },
  { name: 'Peshawar', country: 'Pakistan', countryCode: 'PK', lat: 34.01, lon: 71.58, timezone: 'Asia/Karachi' },
  { name: 'Faisalabad', country: 'Pakistan', countryCode: 'PK', lat: 31.42, lon: 73.08, timezone: 'Asia/Karachi' },
  { name: 'Delhi', country: 'India', countryCode: 'IN', lat: 28.61, lon: 77.21, timezone: 'Asia/Kolkata' },
  { name: 'Mumbai', country: 'India', countryCode: 'IN', lat: 19.08, lon: 72.88, timezone: 'Asia/Kolkata' },
  { name: 'Hyderabad', country: 'India', countryCode: 'IN', lat: 17.38, lon: 78.49, timezone: 'Asia/Kolkata' },
  { name: 'Lucknow', country: 'India', countryCode: 'IN', lat: 26.85, lon: 80.95, timezone: 'Asia/Kolkata' },
  { name: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', lat: 23.81, lon: 90.41, timezone: 'Asia/Dhaka' },
  { name: 'Chittagong', country: 'Bangladesh', countryCode: 'BD', lat: 22.34, lon: 91.83, timezone: 'Asia/Dhaka' },

  // Turkey (Turkey)
  { name: 'Istanbul', country: 'Turkey', countryCode: 'TR', lat: 41.01, lon: 28.98, timezone: 'Europe/Istanbul' },
  { name: 'Ankara', country: 'Turkey', countryCode: 'TR', lat: 39.93, lon: 32.85, timezone: 'Europe/Istanbul' },
  { name: 'Izmir', country: 'Turkey', countryCode: 'TR', lat: 38.42, lon: 27.14, timezone: 'Europe/Istanbul' },
  { name: 'Bursa', country: 'Turkey', countryCode: 'TR', lat: 40.19, lon: 29.06, timezone: 'Europe/Istanbul' },

  // Iran (Tehran)
  { name: 'Tehran', country: 'Iran', countryCode: 'IR', lat: 35.69, lon: 51.39, timezone: 'Asia/Tehran' },
  { name: 'Isfahan', country: 'Iran', countryCode: 'IR', lat: 32.65, lon: 51.68, timezone: 'Asia/Tehran' },
  { name: 'Mashhad', country: 'Iran', countryCode: 'IR', lat: 36.30, lon: 59.61, timezone: 'Asia/Tehran' },
  { name: 'Tabriz', country: 'Iran', countryCode: 'IR', lat: 38.08, lon: 46.29, timezone: 'Asia/Tehran' },

  // Southeast Asia (Singapore)
  { name: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.35, lon: 103.82, timezone: 'Asia/Singapore' },
  { name: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', lat: 3.14, lon: 101.69, timezone: 'Asia/Kuala_Lumpur' },
  { name: 'Jakarta', country: 'Indonesia', countryCode: 'ID', lat: -6.21, lon: 106.85, timezone: 'Asia/Jakarta' },
  { name: 'Surabaya', country: 'Indonesia', countryCode: 'ID', lat: -7.25, lon: 112.75, timezone: 'Asia/Jakarta' },
  { name: 'Bandung', country: 'Indonesia', countryCode: 'ID', lat: -6.91, lon: 107.61, timezone: 'Asia/Jakarta' },
  { name: 'Medan', country: 'Indonesia', countryCode: 'ID', lat: 3.59, lon: 98.67, timezone: 'Asia/Jakarta' },
  { name: 'Manila', country: 'Philippines', countryCode: 'PH', lat: 14.60, lon: 120.98, timezone: 'Asia/Manila' },
  { name: 'Bangkok', country: 'Thailand', countryCode: 'TH', lat: 13.76, lon: 100.50, timezone: 'Asia/Bangkok' },

  // Africa (Egyptian / MWL)
  { name: 'Lagos', country: 'Nigeria', countryCode: 'NG', lat: 6.52, lon: 3.38, timezone: 'Africa/Lagos' },
  { name: 'Abuja', country: 'Nigeria', countryCode: 'NG', lat: 9.06, lon: 7.49, timezone: 'Africa/Lagos' },
  { name: 'Kano', country: 'Nigeria', countryCode: 'NG', lat: 12.00, lon: 8.52, timezone: 'Africa/Lagos' },
  { name: 'Casablanca', country: 'Morocco', countryCode: 'MA', lat: 33.57, lon: -7.59, timezone: 'Africa/Casablanca' },
  { name: 'Rabat', country: 'Morocco', countryCode: 'MA', lat: 34.02, lon: -6.84, timezone: 'Africa/Casablanca' },
  { name: 'Tunis', country: 'Tunisia', countryCode: 'TN', lat: 36.81, lon: 10.18, timezone: 'Africa/Tunis' },
  { name: 'Algiers', country: 'Algeria', countryCode: 'DZ', lat: 36.74, lon: 3.09, timezone: 'Africa/Algiers' },
  { name: 'Tripoli', country: 'Libya', countryCode: 'LY', lat: 32.90, lon: 13.18, timezone: 'Africa/Tripoli' },
  { name: 'Khartoum', country: 'Sudan', countryCode: 'SD', lat: 15.50, lon: 32.56, timezone: 'Africa/Khartoum' },
  { name: 'Nairobi', country: 'Kenya', countryCode: 'KE', lat: -1.29, lon: 36.82, timezone: 'Africa/Nairobi' },
  { name: 'Dar es Salaam', country: 'Tanzania', countryCode: 'TZ', lat: -6.79, lon: 39.28, timezone: 'Africa/Dar_es_Salaam' },
  { name: 'Addis Ababa', country: 'Ethiopia', countryCode: 'ET', lat: 9.02, lon: 38.75, timezone: 'Africa/Addis_Ababa' },
  { name: 'Mogadishu', country: 'Somalia', countryCode: 'SO', lat: 2.05, lon: 45.32, timezone: 'Africa/Mogadishu' },
  { name: 'Dakar', country: 'Senegal', countryCode: 'SN', lat: 14.69, lon: -17.44, timezone: 'Africa/Dakar' },
  { name: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', lat: -26.20, lon: 28.05, timezone: 'Africa/Johannesburg' },
  { name: 'Cape Town', country: 'South Africa', countryCode: 'ZA', lat: -33.93, lon: 18.42, timezone: 'Africa/Johannesburg' },

  // Middle East / Levant
  { name: 'Baghdad', country: 'Iraq', countryCode: 'IQ', lat: 33.31, lon: 44.37, timezone: 'Asia/Baghdad' },
  { name: 'Erbil', country: 'Iraq', countryCode: 'IQ', lat: 36.19, lon: 44.01, timezone: 'Asia/Baghdad' },
  { name: 'Damascus', country: 'Syria', countryCode: 'SY', lat: 33.51, lon: 36.29, timezone: 'Asia/Damascus' },
  { name: 'Aleppo', country: 'Syria', countryCode: 'SY', lat: 36.20, lon: 37.15, timezone: 'Asia/Damascus' },
  { name: 'Amman', country: 'Jordan', countryCode: 'JO', lat: 31.95, lon: 35.93, timezone: 'Asia/Amman' },
  { name: 'Beirut', country: 'Lebanon', countryCode: 'LB', lat: 33.89, lon: 35.50, timezone: 'Asia/Beirut' },
  { name: 'Jerusalem', country: 'Palestine', countryCode: 'PS', lat: 31.77, lon: 35.23, timezone: 'Asia/Hebron' },
  { name: 'Gaza', country: 'Palestine', countryCode: 'PS', lat: 31.50, lon: 34.47, timezone: 'Asia/Gaza' },
  { name: 'Sana\'a', country: 'Yemen', countryCode: 'YE', lat: 15.35, lon: 44.21, timezone: 'Asia/Aden' },

  // Central Asia
  { name: 'Kabul', country: 'Afghanistan', countryCode: 'AF', lat: 34.53, lon: 69.17, timezone: 'Asia/Kabul' },
  { name: 'Tashkent', country: 'Uzbekistan', countryCode: 'UZ', lat: 41.30, lon: 69.28, timezone: 'Asia/Tashkent' },
  { name: 'Almaty', country: 'Kazakhstan', countryCode: 'KZ', lat: 43.24, lon: 76.95, timezone: 'Asia/Almaty' },
  { name: 'Bishkek', country: 'Kyrgyzstan', countryCode: 'KG', lat: 42.87, lon: 74.59, timezone: 'Asia/Bishkek' },
  { name: 'Dushanbe', country: 'Tajikistan', countryCode: 'TJ', lat: 38.56, lon: 68.77, timezone: 'Asia/Dushanbe' },
  { name: 'Baku', country: 'Azerbaijan', countryCode: 'AZ', lat: 40.41, lon: 49.87, timezone: 'Asia/Baku' },

  // Europe (MWL)
  { name: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.51, lon: -0.13, timezone: 'Europe/London' },
  { name: 'Birmingham', country: 'United Kingdom', countryCode: 'GB', lat: 52.49, lon: -1.90, timezone: 'Europe/London' },
  { name: 'Paris', country: 'France', countryCode: 'FR', lat: 48.86, lon: 2.35, timezone: 'Europe/Paris' },
  { name: 'Marseille', country: 'France', countryCode: 'FR', lat: 43.30, lon: 5.37, timezone: 'Europe/Paris' },
  { name: 'Berlin', country: 'Germany', countryCode: 'DE', lat: 52.52, lon: 13.41, timezone: 'Europe/Berlin' },
  { name: 'Cologne', country: 'Germany', countryCode: 'DE', lat: 50.94, lon: 6.96, timezone: 'Europe/Berlin' },
  { name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', lat: 52.37, lon: 4.90, timezone: 'Europe/Amsterdam' },
  { name: 'Brussels', country: 'Belgium', countryCode: 'BE', lat: 50.85, lon: 4.35, timezone: 'Europe/Brussels' },
  { name: 'Vienna', country: 'Austria', countryCode: 'AT', lat: 48.21, lon: 16.37, timezone: 'Europe/Vienna' },
  { name: 'Stockholm', country: 'Sweden', countryCode: 'SE', lat: 59.33, lon: 18.07, timezone: 'Europe/Stockholm' },
  { name: 'Oslo', country: 'Norway', countryCode: 'NO', lat: 59.91, lon: 10.75, timezone: 'Europe/Oslo' },
  { name: 'Copenhagen', country: 'Denmark', countryCode: 'DK', lat: 55.68, lon: 12.57, timezone: 'Europe/Copenhagen' },
  { name: 'Helsinki', country: 'Finland', countryCode: 'FI', lat: 60.17, lon: 24.94, timezone: 'Europe/Helsinki' },
  { name: 'Rome', country: 'Italy', countryCode: 'IT', lat: 41.90, lon: 12.50, timezone: 'Europe/Rome' },
  { name: 'Milan', country: 'Italy', countryCode: 'IT', lat: 45.46, lon: 9.19, timezone: 'Europe/Rome' },
  { name: 'Madrid', country: 'Spain', countryCode: 'ES', lat: 40.42, lon: -3.70, timezone: 'Europe/Madrid' },
  { name: 'Barcelona', country: 'Spain', countryCode: 'ES', lat: 41.39, lon: 2.17, timezone: 'Europe/Madrid' },
  { name: 'Sarajevo', country: 'Bosnia', countryCode: 'BA', lat: 43.86, lon: 18.41, timezone: 'Europe/Sarajevo' },
  { name: 'Tirana', country: 'Albania', countryCode: 'AL', lat: 41.33, lon: 19.82, timezone: 'Europe/Tirane' },
  { name: 'Pristina', country: 'Kosovo', countryCode: 'XK', lat: 42.66, lon: 21.17, timezone: 'Europe/Belgrade' },
  { name: 'Moscow', country: 'Russia', countryCode: 'RU', lat: 55.76, lon: 37.62, timezone: 'Europe/Moscow' },
  { name: 'Athens', country: 'Greece', countryCode: 'GR', lat: 37.98, lon: 23.73, timezone: 'Europe/Athens' },

  // East Asia / Oceania
  { name: 'Beijing', country: 'China', countryCode: 'CN', lat: 39.90, lon: 116.41, timezone: 'Asia/Shanghai' },
  { name: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.68, lon: 139.69, timezone: 'Asia/Tokyo' },
  { name: 'Seoul', country: 'South Korea', countryCode: 'KR', lat: 37.57, lon: 126.98, timezone: 'Asia/Seoul' },
  { name: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.87, lon: 151.21, timezone: 'Australia/Sydney' },
  { name: 'Melbourne', country: 'Australia', countryCode: 'AU', lat: -37.81, lon: 144.96, timezone: 'Australia/Melbourne' },
  { name: 'Auckland', country: 'New Zealand', countryCode: 'NZ', lat: -36.85, lon: 174.76, timezone: 'Pacific/Auckland' },

  // South America
  { name: 'Sao Paulo', country: 'Brazil', countryCode: 'BR', lat: -23.55, lon: -46.63, timezone: 'America/Sao_Paulo' },
  { name: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', lat: -34.60, lon: -58.38, timezone: 'America/Argentina/Buenos_Aires' },
  { name: 'Bogota', country: 'Colombia', countryCode: 'CO', lat: 4.71, lon: -74.07, timezone: 'America/Bogota' },
  { name: 'Lima', country: 'Peru', countryCode: 'PE', lat: -12.05, lon: -77.04, timezone: 'America/Lima' },
  { name: 'Paramaribo', country: 'Suriname', countryCode: 'SR', lat: 5.85, lon: -55.20, timezone: 'America/Paramaribo' },
  { name: 'Georgetown', country: 'Guyana', countryCode: 'GY', lat: 6.80, lon: -58.16, timezone: 'America/Guyana' },
  { name: 'Trinidad', country: 'Trinidad and Tobago', countryCode: 'TT', lat: 10.66, lon: -61.52, timezone: 'America/Port_of_Spain' },

  // Caribbean / Central America
  { name: 'Mexico City', country: 'Mexico', countryCode: 'MX', lat: 19.43, lon: -99.13, timezone: 'America/Mexico_City' },

  // Additional Muslim-majority cities
  { name: 'Colombo', country: 'Sri Lanka', countryCode: 'LK', lat: 6.93, lon: 79.85, timezone: 'Asia/Colombo' },
  { name: 'Maldives', country: 'Maldives', countryCode: 'MV', lat: 4.18, lon: 73.51, timezone: 'Indian/Maldives' },
  { name: 'Brunei', country: 'Brunei', countryCode: 'BN', lat: 4.94, lon: 114.95, timezone: 'Asia/Brunei' },
  { name: 'Niamey', country: 'Niger', countryCode: 'NE', lat: 13.51, lon: 2.11, timezone: 'Africa/Niamey' },
  { name: 'Bamako', country: 'Mali', countryCode: 'ML', lat: 12.64, lon: -8.00, timezone: 'Africa/Bamako' },
  { name: 'Nouakchott', country: 'Mauritania', countryCode: 'MR', lat: 18.09, lon: -15.98, timezone: 'Africa/Nouakchott' },
  { name: 'Conakry', country: 'Guinea', countryCode: 'GN', lat: 9.64, lon: -13.58, timezone: 'Africa/Conakry' },
  { name: 'Djibouti', country: 'Djibouti', countryCode: 'DJ', lat: 11.59, lon: 43.15, timezone: 'Africa/Djibouti' },
];
