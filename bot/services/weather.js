const axios = require('axios')
const { getCache, setCache } = require('./cache')

const CACHE_KEY = 'weather:phnompenh'
const CACHE_TTL = 1800 // 30 minutes

const ICONS = {
  Clear: '☀️', Clouds: '☁️', Rain: '🌧️',
  Drizzle: '🌦️', Thunderstorm: '⛈️',
  Mist: '🌫️', Haze: '🌫️', Smoke: '🌫️',
}

async function getPhnomPenhWeather() {
  const cached = await getCache(CACHE_KEY)
  if (cached) return JSON.parse(cached)

  const { data } = await axios.get(
    'https://api.openweathermap.org/data/2.5/weather',
    {
      params: {
        q: 'Phnom Penh,KH',
        appid: process.env.OPENWEATHER_KEY,
        units: 'metric',
      },
      timeout: 5000,
    }
  )

  const weather = {
    temp: Math.round(data.main.temp),
    feels: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    desc: data.weather[0].main,
    detail: data.weather[0].description,
    wind: data.wind.speed,
    icon: ICONS[data.weather[0].main] || '🌡️',
  }

  await setCache(CACHE_KEY, JSON.stringify(weather), CACHE_TTL)
  return weather
}

module.exports = { getPhnomPenhWeather }