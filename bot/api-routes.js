// bot/api-routes.js
// Express routes called by the Vercel Mini App
const express  = require('express')
const router   = express.Router()
const { getUSDtoKHR }         = require('./services/fx')
const { getPhnomPenhWeather } = require('./services/weather')
const { getRicePrices }       = require('./db/neon')

// Allow Mini App (Vercel) to call this backend (Render)
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

// GET /api/currency?amount=10&from=USD
router.get('/currency', async (req, res) => {
  try {
    const amount = parseFloat(req.query.amount)
    const from   = (req.query.from || 'USD').toUpperCase()

    if (isNaN(amount) || amount <= 0)
      return res.status(400).json({ error: 'Invalid amount' })

    const rate = await getUSDtoKHR()  // USD → KHR rate

    let result
    if (from === 'KHR') {
      result = (amount / rate).toFixed(2)
    } else {
      result = Math.round(amount * rate)
    }

    res.json({ amount, from, to: from === 'USD' ? 'KHR' : 'USD', rate, result })
  } catch (err) {
    console.error('Currency API error:', err.message)
    res.status(500).json({ error: 'Could not fetch exchange rate' })
  }
})

// GET /api/prices
router.get('/prices', async (req, res) => {
  try {
    const prices = await getRicePrices()
    res.json({ prices })
  } catch (err) {
    console.error('Prices API error:', err.message)
    res.status(500).json({ error: 'Could not fetch prices' })
  }
})

// POST /api/loan  { principal, rate, months }
router.post('/loan', (req, res) => {
  try {
    const { principal, rate, months } = req.body
    const p = parseFloat(principal)
    const r = parseFloat(rate)
    const m = parseInt(months)

    if (!p || !r || !m || p <= 0 || r < 0 || m < 1)
      return res.status(400).json({ error: 'Invalid loan parameters' })

    const monthlyRate = r / 100 / 12
    let monthly
    if (monthlyRate === 0) {
      monthly = p / m
    } else {
      monthly = (p * monthlyRate * Math.pow(1 + monthlyRate, m)) /
                (Math.pow(1 + monthlyRate, m) - 1)
    }

    const total    = monthly * m
    const interest = total - p
    const khrRate  = 4100  // approximate, or fetch live

    res.json({
      monthly:    Math.round(monthly),
      total:      Math.round(total),
      interest:   Math.round(interest),
      months:     m,
      monthlyKHR: Math.round(monthly * khrRate),
      totalKHR:   Math.round(total * khrRate),
    })
  } catch (err) {
    console.error('Loan API error:', err.message)
    res.status(500).json({ error: 'Calculation failed' })
  }
})

// GET /api/weather
router.get('/weather', async (req, res) => {
  try {
    const w = await getPhnomPenhWeather()
    res.json(w)
  } catch (err) {
    console.error('Weather API error:', err.message)
    res.status(500).json({ error: 'Could not fetch weather' })
  }
})

module.exports = router