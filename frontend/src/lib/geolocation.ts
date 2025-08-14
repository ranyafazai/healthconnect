// Lightweight geolocation + reverse geocoding helpers

export interface ReverseGeocodeAddressParts {
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  postcode?: string;
  county?: string;
  country?: string;
}

export interface ReverseGeocodeResult {
  lat: string;
  lon: string;
  display_name?: string;
  address?: ReverseGeocodeAddressParts;
}

export async function getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...(options || {})
    });
  });
}

export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        // Some providers require a descriptive UA/Referer per usage policy
      }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data as ReverseGeocodeResult;
  } catch {
    return null;
  }
}

export function extractCity(address?: ReverseGeocodeAddressParts): string | undefined {
  if (!address) return undefined;
  return address.city || address.town || address.village || address.suburb || address.neighbourhood;
}

export function extractState(address?: ReverseGeocodeAddressParts): string | undefined {
  if (!address) return undefined;
  return address.state || address.county;
}

export function extractZip(address?: ReverseGeocodeAddressParts): string | undefined {
  return address?.postcode;
}

export function buildStreetAddress(address?: ReverseGeocodeAddressParts): string | undefined {
  if (!address) return undefined;
  const parts = [address.house_number, address.road];
  const street = parts.filter(Boolean).join(' ');
  return street || undefined;
}


