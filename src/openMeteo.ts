export type GeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  timezone?: string;
  population?: number;
};

type GeocodingResponse = {
  results?: GeocodingResult[];
};

export type CurrentWeatherResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  current_units: Record<string, string>;
};

export type DailyForecastResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
  };
  daily_units: Record<string, string>;
};

const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1";
const FORECAST_BASE_URL = "https://api.open-meteo.com/v1";

async function getJson<T>(url: URL): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Open-Meteo request failed: ${response.status} ${response.statusText} - ${body}`
    );
  }

  return response.json() as Promise<T>;
}

export async function searchLocations(
  name: string,
  count: number
): Promise<GeocodingResult[]> {
  const url = new URL(`${GEOCODING_BASE_URL}/search`);
  url.searchParams.set("name", name);
  url.searchParams.set("count", String(count));
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const data = await getJson<GeocodingResponse>(url);
  return data.results ?? [];
}

export async function getCurrentWeather(
  latitude: number,
  longitude: number
): Promise<CurrentWeatherResponse> {
  const url = new URL(`${FORECAST_BASE_URL}/forecast`);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "wind_speed_10m",
      "wind_direction_10m"
    ].join(",")
  );
  url.searchParams.set("timezone", "auto");

  return getJson<CurrentWeatherResponse>(url);
}

export async function getDailyForecast(
  latitude: number,
  longitude: number,
  days: number
): Promise<DailyForecastResponse> {
  const url = new URL(`${FORECAST_BASE_URL}/forecast`);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "daily",
    [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "wind_speed_10m_max"
    ].join(",")
  );
  url.searchParams.set("forecast_days", String(days));
  url.searchParams.set("timezone", "auto");

  return getJson<DailyForecastResponse>(url);
}
