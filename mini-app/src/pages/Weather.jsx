import React, { useEffect, useState } from 'react'
import { getWeather } from '../services/api'

const ICONS = {
  Clear: '☀️', Clouds: '☁️', Rain: '🌧️',
  Drizzle: '🌦️', Thunderstorm: '⛈️', Mist: '🌫️', Haze: '🌫️',
}

export default function Weather() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    getWeather()
      .then(data => setWeather(data))
      .catch(() => setError('Could not load weather. Check your API key.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner" />
  if (error)   return <p className="error" style={{ padding: 24 }}>{error}</p>

  const icon = ICONS[weather.desc] || '🌡️'

  return (
    <div style={{ padding: '20px 16px 0' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>🌤 Weather</h2>

      {/* Main temp card */}
      <div className="card" style={{ textAlign: 'center', padding: '32px 16px' }}>
        <div style={{ fontSize: 56 }}>{icon}</div>
        <div style={{ fontSize: 48, fontWeight: 700, margin: '8px 0' }}>
          {weather.temp}°C
        </div>
        <div style={{ fontSize: 16, color: 'var(--tg-hint)', textTransform: 'capitalize' }}>
          {weather.detail}
        </div>
        <div style={{ fontSize: 13, color: 'var(--tg-hint)', marginTop: 4 }}>
          Phnom Penh
        </div>
      </div>

      {/* Detail row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { label: 'Feels like', value: `${weather.feels}°C` },
          { label: 'Humidity',   value: `${weather.humidity}%` },
          { label: 'Wind',       value: `${weather.wind} m/s` },
        ].map(item => (
          <div key={item.label} className="card" style={{ textAlign: 'center', padding: '14px 8px' }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{item.value}</div>
            <div style={{ fontSize: 11, color: 'var(--tg-hint)', marginTop: 3 }}>{item.label}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: 'var(--tg-hint)', textAlign: 'center', marginTop: 16 }}>
        Updated every 30 minutes
      </p>
    </div>
  )
}