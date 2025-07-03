"use client";
import React, { useState } from "react";
import { Search, MapPin, Thermometer, Droplets, Wind, Eye, Sunrise, Sunset, Clock } from "lucide-react";

const weatherIcons: Record<string, string> = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Mist: "🌫️",
  Smoke: "🌫️",
  Haze: "🌫️",
  Dust: "🌫️",
  Fog: "🌫️",
  Sand: "🌫️",
  Ash: "🌫️",
  Squall: "🌬️",
  Tornado: "🌪️",
};

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

// For future use: type WeatherData = { temperature: number; description: string; icon: string; };

export default function WeatherPage() {
  const [city, setCity] = useState("Sydney,AU");
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError("");
    setWeather(null);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      setWeather(data);
    } catch (e) {
      setError("Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchWeather(city);
    // eslint-disable-next-line
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) fetchWeather(city);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getWeatherGradient = (weatherMain: string) => {
    switch (weatherMain) {
      case 'Clear':
        return 'from-yellow-400 via-orange-300 to-blue-200';
      case 'Clouds':
        return 'from-blue-200 via-gray-200 to-blue-400';
      case 'Rain':
      case 'Drizzle':
        return 'from-blue-400 via-blue-300 to-indigo-200';
      case 'Thunderstorm':
        return 'from-purple-400 via-gray-300 to-blue-200';
      case 'Snow':
        return 'from-blue-100 via-white to-gray-200';
      default:
        return 'from-blue-200 via-blue-100 to-blue-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100">
      {/* Hero Section */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-12 bg-gradient-to-r from-blue-200 via-white to-blue-100 rounded-b-3xl shadow-lg mb-12">
        <div className="flex-1 flex flex-col items-start md:items-start">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl md:text-7xl">
              {weather ? (weatherIcons[weather.weather[0].main] || "🌈") : "☀️"}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 leading-tight drop-shadow-sm">Weather Alert</h1>
          </div>
          <p className="text-lg md:text-xl text-blue-700 max-w-xl">Stay informed about current weather conditions on campus.</p>
        </div>
      </section>

      {/* Search Card */}
      <section className="max-w-3xl mx-auto px-4 mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Location
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                placeholder="Enter city (e.g. Sydney,AU)"
                aria-label="City"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Loading...' : 'Search'}
            </button>
          </form>
        </div>
      </section>

      {/* Weather Info Section */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Weather Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {loading && (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Fetching weather data...</p>
                </div>
              )}
              {error && (
                <div className="p-8 text-center">
                  <div className="text-red-500 text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Weather Unavailable</h3>
                  <p className="text-gray-600">{error}</p>
                </div>
              )}
              {weather && !error && (
                <div className={`bg-gradient-to-br ${getWeatherGradient(weather.weather[0].main)} p-8 text-blue-900`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">{weather.name}, {weather.sys.country}</h2>
                      <p className="text-blue-900/80">{weather.weather[0].description}</p>
                    </div>
                    <div className="text-7xl">
                      {weatherIcons[weather.weather[0].main] || "🌈"}
                    </div>
                  </div>
                  <div className="text-center mb-8">
                    <div className="text-7xl font-bold mb-2">{Math.round(weather.main.temp)}°C</div>
                    <div className="text-xl text-blue-900/80">Feels like {Math.round(weather.main.feels_like)}°C</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/40 rounded-xl p-4 text-center">
                      <Thermometer className="w-6 h-6 mx-auto mb-2 text-blue-700" />
                      <div className="text-sm text-blue-900/80">High</div>
                      <div className="text-xl font-bold">{Math.round(weather.main.temp_max)}°C</div>
                    </div>
                    <div className="bg-white/40 rounded-xl p-4 text-center">
                      <Thermometer className="w-6 h-6 mx-auto mb-2 text-blue-700" />
                      <div className="text-sm text-blue-900/80">Low</div>
                      <div className="text-xl font-bold">{Math.round(weather.main.temp_min)}°C</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Weather Details Sidebar */}
          <div className="space-y-8">
            {weather && !error && (
              <>
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Current Conditions</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Droplets className="w-5 h-5 text-blue-500" />
                        <span className="text-blue-900">Humidity</span>
                      </div>
                      <span className="font-semibold text-blue-900">{weather.main.humidity}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Wind className="w-5 h-5 text-blue-500" />
                        <span className="text-blue-900">Wind Speed</span>
                      </div>
                      <span className="font-semibold text-blue-900">{weather.wind.speed} m/s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-blue-500" />
                        <span className="text-blue-900">Visibility</span>
                      </div>
                      <span className="font-semibold text-blue-900">{weather.visibility / 1000} km</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Sunrise & Sunset</h3>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sunrise className="w-5 h-5 text-yellow-500" />
                      <span className="text-blue-900">Sunrise</span>
                    </div>
                    <span className="font-semibold text-blue-900">{formatTime(weather.sys.sunrise)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sunset className="w-5 h-5 text-orange-500" />
                      <span className="text-blue-900">Sunset</span>
                    </div>
                    <span className="font-semibold text-blue-900">{formatTime(weather.sys.sunset)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
} 