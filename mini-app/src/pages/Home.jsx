import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTelegram } from '../hooks/useTelegram'

const MENU = [
  { path: '/currency', icon: '💱', label: 'Currency',  sub: 'KHR ↔ USD converter'      },
  { path: '/loan',     icon: '🏦', label: 'Loan Calc', sub: 'Monthly repayment planner' },
  { path: '/prices',   icon: '🌾', label: 'Rice Prices', sub: 'Phnom Penh market rates' },
  { path: '/weather',  icon: '🌤', label: 'Weather',   sub: 'Phnom Penh forecast'       },
]

export default function Home() {
  const navigate    = useNavigate()
  const { user, haptic } = useTelegram()

  const greet = user ? `Hello, ${user.first_name}!` : 'Hello!'

  return (
    <div style={{ padding: '20px 16px 0' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--tg-hint)', marginBottom: 2 }}>{greet}</p>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>🇰🇭 KhmerAssist</h1>
        <p style={{ fontSize: 13, color: 'var(--tg-hint)', marginTop: 4 }}>
          Your Cambodia daily life companion
        </p>
      </div>

      {/* Menu grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {MENU.map(item => (
          <button
            key={item.path}
            onClick={() => { haptic('light'); navigate(item.path) }}
            style={{
              background: 'var(--tg-surface)',
              border: 'none',
              borderRadius: 16,
              padding: '20px 14px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onTouchStart={e => e.currentTarget.style.opacity = '0.7'}
            onTouchEnd={e => e.currentTarget.style.opacity = '1'}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tg-text)', marginBottom: 3 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 12, color: 'var(--tg-hint)', lineHeight: 1.4 }}>
              {item.sub}
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--tg-hint)', marginTop: 32 }}>
        Built for everyday life in Cambodia
      </p>
    </div>
  )
}