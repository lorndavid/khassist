const axios = require('axios')
const { getCache, setCache } = require('./cache')
const { saveFXRate, getLatestFXRate } = require('../db/neon')

const CACHE_KEY = 'fx:usd_khr'
const CACHE_TTL = 3600 // 1 hour

/**
 * Get USD → KHR rate.
 * Priority: 1) Upstash Redis cache → 2) Live API → 3) Neon DB fallback
 */
async function getUSDtoKHR() {
  // 1. Try Redis cache (fastest)
  const cached = await getCache(CACHE_KEY)
  if (cached) return parseFloat(cached)

  try {
    // 2. Fetch from free API (no key needed)
    const { data } = await axios.get(
      'https://open.er-api.com/v6/latest/USD',
      { timeout: 5000 }
    )
    const rate = data.rates.KHR

    // Save to Redis cache
    await setCache(CACHE_KEY, rate.toString(), CACHE_TTL)

    // Also save to Neon as fallback
    await saveFXRate('USD', 'KHR', rate).catch(() => {})

    return rate
  } catch (err) {
    console.warn('Live FX API failed, trying DB fallback:', err.message)

    // 3. DB fallback — use last known rate from Neon
    const dbRate = await getLatestFXRate('USD', 'KHR')
    if (dbRate) return parseFloat(dbRate)

    // Hard fallback — approximate rate
    return 4100
  }
}

module.exports = { getUSDtoKHR }