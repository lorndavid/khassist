import React, { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useTelegram } from './hooks/useTelegram'
import Home      from './pages/Home'
import Currency  from './pages/Currency'
import LoanCalc  from './pages/LoanCalc'
import Prices    from './pages/Prices'
import Weather   from './pages/Weather'

export default function App() {
  const { tg } = useTelegram()
  const navigate  = useNavigate()
  const location  = useLocation()

  // Show Telegram back button on sub-pages
  useEffect(() => {
    if (!tg?.BackButton) return
    if (location.pathname === '/') {
      tg.BackButton.hide()
    } else {
      tg.BackButton.show()
      const goBack = () => navigate('/')
      tg.BackButton.onClick(goBack)
      return () => tg.BackButton.offClick(goBack)
    }
  }, [location.pathname, tg, navigate])

  return (
    <div style={{ padding: '0 0 24px' }}>
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/currency" element={<Currency />} />
        <Route path="/loan"     element={<LoanCalc />} />
        <Route path="/prices"   element={<Prices />} />
        <Route path="/weather"  element={<Weather />} />
      </Routes>
    </div>
  )
}