import axios from 'axios'

// In dev this points to localhost, in production to your Render URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
})

// GET /api/currency?amount=10&from=USD
export async function convertCurrency(amount, from = 'USD') {
  const { data } = await api.get('/api/currency', { params: { amount, from } })
  return data
}

// GET /api/prices
export async function getRicePrices() {
  const { data } = await api.get('/api/prices')
  return data
}

// POST /api/loan  { principal, rate, months }
export async function calculateLoan(principal, rate, months) {
  const { data } = await api.post('/api/loan', { principal, rate, months })
  return data
}

// GET /api/weather
export async function getWeather() {
  const { data } = await api.get('/api/weather')
  return data
}