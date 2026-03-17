import React, { useState } from 'react'
import { convertCurrency } from '../services/api'
import { useTelegram } from '../hooks/useTelegram'

export default function Currency() {
  const { haptic } = useTelegram()
  const [amount, setAmount]   = useState('')
  const [from,   setFrom]     = useState('USD')
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,  setError]    = useState('')

  const to = from === 'USD' ? 'KHR' : 'USD'

  async function handleConvert() {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    setError('')
    setLoading(true)
    haptic('light')
    try {
      const data = await convertCurrency(Number(amount), from)
      setResult(data)
    } catch {
      setError('Could not fetch exchange rate. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function swap() {
    haptic('light')
    setFrom(f => f === 'USD' ? 'KHR' : 'USD')
    setResult(null)
    setAmount('')
  }

  return (
    <div style={{ padding: '20px 16px 0' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>💱 Currency</h2>

      {/* Amount input */}
      <div className="card">
        <label className="label">Amount ({from})</label>
        <input
          className="input"
          type="number"
          inputMode="decimal"
          placeholder={from === 'USD' ? '10.00' : '40000'}
          value={amount}
          onChange={e => { setAmount(e.target.value); setResult(null) }}
        />
      </div>

      {/* Direction selector */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--tg-hint)', marginBottom: 2 }}>Converting</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{from} → {to}</div>
        </div>
        <button
          onClick={swap}
          style={{
            background: 'var(--tg-button)',
            color: 'var(--tg-btn-text)',
            border: 'none',
            borderRadius: 10,
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ⇅ Swap
        </button>
      </div>

      {/* Convert button */}
      <button className="btn" onClick={handleConvert} disabled={loading}>
        {loading ? 'Converting...' : 'Convert'}
      </button>

      {error && <p className="error">{error}</p>}

      {/* Result */}
      {result && (
        <div className="result-box">
          <div className="result-big">
            {result.from === 'USD'
              ? `${Number(result.result).toLocaleString()} KHR`
              : `$${Number(result.result).toFixed(2)} USD`
            }
          </div>
          <div className="result-sub">
            {result.from === 'USD'
              ? `$${result.amount} USD at rate ${Number(result.rate).toLocaleString()} KHR`
              : `${Number(result.amount).toLocaleString()} KHR at rate ${Number(result.rate).toLocaleString()} KHR`
            }
          </div>
        </div>
      )}
    </div>
  )
}