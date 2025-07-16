"use client";
import { useEffect, useState } from "react";
import { CloudSun, Search, Thermometer, Droplets, Wind, Gauge, Sunrise, Sunset, Eye, CloudRain, Cloud, CloudDrizzle, CloudSnow, CloudLightning, CloudFog, Sun, Moon, Snowflake, Cloudy, CloudOff, CloudRainWind } from "lucide-react";

function getWeatherIcon(main: string, isDay: boolean) {
  switch (main) {
    case "Clear": return isDay ? <Sun className="inline w-7 h-7 text-yellow-400" /> : <Moon className="inline w-7 h-7 text-blue-400" />;
    case "Clouds": return <Cloud className="inline w-7 h-7 text-blue-300" />;
    case "Rain": return <CloudRain className="inline w-7 h-7 text-blue-500" />;
    case "Drizzle": return <CloudDrizzle className="inline w-7 h-7 text-blue-400" />;
    case "Thunderstorm": return <CloudLightning className="inline w-7 h-7 text-yellow-500" />;
    case "Snow": return <Snowflake className="inline w-7 h-7 text-blue-200" />;
    case "Mist":
    case "Fog":
    case "Haze": return <CloudFog className="inline w-7 h-7 text-blue-200" />;
    case "Smoke": return <CloudFog className="inline w-7 h-7 text-gray-400" />;
    case "Dust":
    case "Sand": return <CloudOff className="inline w-7 h-7 text-yellow-300" />;
    case "Ash": return <CloudOff className="inline w-7 h-7 text-gray-500" />;
    case "Squall": return <CloudRainWind className="inline w-7 h-7 text-blue-400" />;
    case "Tornado": return <Gauge className="inline w-7 h-7 text-red-500" />;
    default: return <Cloudy className="inline w-7 h-7 text-blue-300" />;
  }
}

export default function WeatherAlertPage() {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState("London");
  const [input, setInput] = useState("London");

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError(null);
    setWeather(null);
    try {
      const res = await fetch(`/api/weather-alert?q=${encodeURIComponent(cityName)}`);
      if (!res.ok) throw new Error("Failed to fetch weather data");
      const data = await res.json();
      if (data.cod && data.cod !== 200) throw new Error(data.message || "No data");
      setWeather(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) setCity(input.trim());
  };

  return (
    <main className="bg-gradient-to-b from-blue-50 via-white to-white min-h-screen w-full">
      {/* Hero Section */}
      <section className="w-full py-16 px-4 flex flex-col items-center text-center bg-gradient-to-r from-blue-100/60 to-white">
        <CloudSun className="w-14 h-14 text-blue-500 mb-4 drop-shadow" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-2">Weather Alert</h1>
        <span className="block w-16 h-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-700 mb-4"></span>
        <p className="text-lg md:text-xl text-blue-700 max-w-2xl mx-auto font-medium">
          Get real-time weather updates and alerts for your city. Stay safe and plan ahead!
        </p>
      </section>

      {/* Weather Search & Result */}
      <section className="max-w-xl mx-auto py-10 px-4">
        <form onSubmit={handleSearch} className="mb-6 flex gap-2 items-center justify-center">
          <div className="relative w-full">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter city name..."
              className="border border-blue-200 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-400 text-blue-900 bg-white shadow-sm placeholder:text-blue-300"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
          </div>
          <button
            type="submit"
            className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-800 transition text-base"
          >
            Search
          </button>
        </form>
        {loading && <p className="text-blue-700 font-medium">Loading weather data...</p>}
        {error && <p className="text-red-500 font-semibold">{error}</p>}
        {weather && (
          <div className="bg-blue-50 rounded-xl p-8 shadow-md mt-6 flex flex-col items-center border border-blue-100 w-full">
            <div className="flex flex-col items-center w-full mb-4">
              <span className="text-2xl md:text-3xl font-bold text-blue-900">{weather.name}, {weather.sys?.country}</span>
              <div className="flex items-center gap-2 mt-2">
                {/* Large central weather graphic */}
                <span className="block">
                  {getWeatherIcon(weather.weather?.[0]?.main, weather.weather?.[0]?.icon?.includes('d'))}
                </span>
                {weather.weather && weather.weather[0] && (
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                    alt={weather.weather[0].description}
                    className="w-20 h-20 inline-block"
                  />
                )}
              </div>
              <div className="text-xl font-semibold mt-2 text-blue-700 flex items-center gap-2">
                <span>{weather.weather?.[0]?.main}</span>
                <span className="text-blue-500">({weather.weather?.[0]?.description})</span>
              </div>
            </div>
            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
              {/* Temperature Card */}
              <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-blue-100">
                <Thermometer className="w-7 h-7 text-blue-400 mb-1" />
                <div className="font-semibold text-blue-900">Temperature</div>
                <div className="text-lg font-bold">{weather.main?.temp}°C</div>
                <div className="text-sm text-blue-700">Feels like {weather.main?.feels_like}°C</div>
                <div className="mt-2 flex items-center gap-2"><Droplets className="w-5 h-5 text-blue-400" />Humidity: <span className="font-bold">{weather.main?.humidity}%</span></div>
                <div className="mt-1 flex items-center gap-2"><Gauge className="w-5 h-5 text-blue-400" />Pressure: <span className="font-bold">{weather.main?.pressure} hPa</span></div>
              </div>
              {/* Wind Card */}
              <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-blue-100">
                <Wind className="w-7 h-7 text-blue-400 mb-1" />
                <div className="font-semibold text-blue-900">Wind</div>
                <div className="text-lg font-bold">{weather.wind?.speed} m/s</div>
                <div className="text-sm text-blue-700">Gust: {weather.wind?.gust ?? 'N/A'} m/s</div>
                <div className="mt-2 flex items-center gap-2"><Eye className="w-5 h-5 text-blue-400" />Visibility: <span className="font-bold">{weather.visibility ? (weather.visibility / 1000).toFixed(1) : 'N/A'} km</span></div>
                <div className="mt-1 flex items-center gap-2"><CloudSun className="w-5 h-5 text-blue-400" />Cloudiness: <span className="font-bold">{weather.clouds?.all ?? 'N/A'}%</span></div>
              </div>
              {/* Sun Card */}
              <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-blue-100">
                <Sunrise className="w-7 h-7 text-yellow-400 mb-1" />
                <div className="font-semibold text-blue-900">Sunrise & Sunset</div>
                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-2"><Sunrise className="w-5 h-5 text-yellow-400" />Sunrise: <span className="font-bold">{weather.sys?.sunrise ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span></span>
                  <span className="flex items-center gap-2 mt-1"><Sunset className="w-5 h-5 text-orange-400" />Sunset: <span className="font-bold">{weather.sys?.sunset ? new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span></span>
                </div>
              </div>
              {/* Atmosphere Card */}
              <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-blue-100">
                <Gauge className="w-7 h-7 text-blue-400 mb-1" />
                <div className="font-semibold text-blue-900">Atmosphere</div>
                <div className="flex items-center gap-2 mt-1"><Gauge className="w-5 h-5 text-blue-400" />Sea Level: <span className="font-bold">{weather.main?.sea_level ?? 'N/A'} hPa</span></div>
                <div className="flex items-center gap-2 mt-1"><Gauge className="w-5 h-5 text-blue-400" />Ground Level: <span className="font-bold">{weather.main?.grnd_level ?? 'N/A'} hPa</span></div>
              </div>
            </div>
            <div className="mt-6 text-xs text-blue-400">Data provided by OpenWeatherMap</div>
          </div>
        )}
      </section>

      {/* Footer Section */}
      <footer className="w-full py-8 px-4 bg-white border-t border-blue-100 mt-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-slate-600 text-sm">
          <div>
            &copy; {new Date().getFullYear()} Campus Connect. All rights reserved.
          </div>
          <div className="flex gap-4 items-center">
            <a href="mailto:info@campusconnect.com" className="hover:text-blue-700 underline">Contact</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 underline">LinkedIn</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 underline">GitHub</a>
            <a href="/support" className="hover:text-blue-700 underline">Support</a>
          </div>
        </div>
      </footer>
    </main>
  );
} 