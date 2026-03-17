import React, { useEffect, useState } from 'react'
import { getRicePrices } from '../services/api'

export default function Prices() {
  const [prices,  setPrices]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    getRicePrices()
      .then(data => setPrices(data.prices || []))
      .catch(() => setError('Could not load prices. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner" />
  if (error)   return <p className="error" style={{ padding: 24 }}>{error}</p>

  return (
    <div style={{ padding: '20px 16px 0' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>🌾 Rice Prices</h2>
      <p style={{ fontSize: 12, color: 'var(--tg-hint)', marginBottom: 20 }}>
        📍 Phnom Penh Central Market
      </p>

      {prices.map((p, i) => (
        <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{p.variety}</div>
            <div style={{ fontSize: 12, color: 'var(--tg-hint)', marginTop: 2 }}>per kilogram</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--tg-button)' }}>
              ${Number(p.price_usd).toFixed(2)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--tg-hint)' }}>
              {Number(p.price_khr).toLocaleString()} KHR
            </div>
          </div>
        </div>
      ))}

      <p style={{ fontSize: 11, color: 'var(--tg-hint)', textAlign: 'center', marginTop: 16 }}>
        Prices updated manually — use /prices in bot for latest
      </p>
    </div>
  )
}