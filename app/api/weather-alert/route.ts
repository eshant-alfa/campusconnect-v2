import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.WEATHER_API_KEY;
  let city = "London";
  const { searchParams } = new URL(req.url);
  if (searchParams.has("q")) {
    city = searchParams.get("q") || "London";
  }
  if (!apiKey) {
    return NextResponse.json({ error: "WEATHER_API_KEY not set" }, { status: 500 });
  }
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      const errData = await res.json();
      return NextResponse.json(errData, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch weather data" }, { status: 500 });
  }
} 