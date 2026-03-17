import React, { useState } from 'react'
import { calculateLoan } from '../services/api'
import { useTelegram } from '../hooks/useTelegram'

export default function LoanCalc() {
  const { haptic } = useTelegram()
  const [principal, setPrincipal] = useState('')
  const [rate,      setRate]      = useState('')
  const [months,    setMonths]    = useState('')
  const [result,    setResult]    = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  async function handleCalculate() {
    if (!principal || !rate || !months) {
      setError('Please fill in all three fields')
      return
    }
    const p = Number(principal), r = Number(rate), m = Number(months)
    if (isNaN(p) || p <= 0) return setError('Enter a valid loan amount')
    if (isNaN(r) || r < 0 || r > 200) return setError('Enter a valid rate (0–200)')
    if (isNaN(m) || m < 1 || m > 360) return setError('Enter months between 1 and 360')

    setError('')
    setLoading(true)
    haptic('light')
    try {
      const data = await calculateLoan(p, r, m)
      setResult(data)
    } catch {
      setError('Calculation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, placeholder, value, onChange, inputMode = 'decimal' }) => (
    <div className="card">
      <label className="label">{label}</label>
      <input
        className="input"
        type="number"
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={e => { onChange(e.target.value); setResult(null) }}
      />
    </div>
  )

  return (
    <div style={{ padding: '20px 16px 0' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>🏦 Loan Calculator</h2>

      <Field label="Loan amount (USD)"         placeholder="e.g. 500"  value={principal} onChange={setPrincipal} />
      <Field label="Annual interest rate (%)"  placeholder="e.g. 18"   value={rate}      onChange={setRate} />
      <Field label="Duration (months)"         placeholder="e.g. 12"   value={months}    onChange={setMonths} inputMode="numeric" />

      <button className="btn" onClick={handleCalculate} disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate'}
      </button>

      {error && <p className="error">{error}</p>}

      {result && (
        <>
          <div className="result-box" style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--tg-hint)', marginBottom: 4 }}>Monthly payment</div>
            <div className="result-big">${Number(result.monthly).toLocaleString()}</div>
            <div className="result-sub">≈ {Number(result.monthlyKHR).toLocaleString()} KHR</div>
          </div>

          <div className="card" style={{ marginTop: 4 }}>
            {[
              ['Total repaid',   `$${Number(result.total).toLocaleString()}`,    `≈ ${Number(result.totalKHR).toLocaleString()} KHR`],
              ['Total interest', `$${Number(result.interest).toLocaleString()}`, ''],
              ['Duration',       `${result.months} months`, `${(result.months/12).toFixed(1)} years`],
            ].map(([label, val, sub]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid var(--tg-bg)' }}>
                <span style={{ fontSize: 13, color: 'var(--tg-hint)' }}>{label}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{val}</div>
                  {sub && <div style={{ fontSize: 11, color: 'var(--tg-hint)' }}>{sub}</div>}
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 11, color: 'var(--tg-hint)', textAlign: 'center', marginTop: 8 }}>
            Common Cambodia lenders: ACLEDA · AMK · Prasac · Wing
          </p>
        </>
      )}
    </div>
  )
}