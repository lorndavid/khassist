const axios = require('axios')
const { getCache, setCache } = require('../services/cache')
const { logCommand } = require('../db/neon')

const CACHE_KEY = 'fx:usd_khr'
const CACHE_TTL = 3600 // 1 hour

async function getUSDtoKHR() {
  // Try cache first
  const cached = await getCache(CACHE_KEY)
  if (cached) return parseFloat(cached)

  // Fetch from free API
  const { data } = await axios.get(
    'https://api.exchangerate-api.com/v4/latest/USD'
  )
  const rate = data.rates.KHR
  await setCache(CACHE_KEY, rate.toString(), CACHE_TTL)
  return rate
}

async function handleCurrency(ctx) {
  await logCommand(ctx.from.id, 'currency').catch(() => {})

  const args = ctx.message.text.split(' ').slice(1)

  // No args — show live rate
  if (args.length === 0) {
    try {
      const rate = await getUSDtoKHR()
      return ctx.replyWithMarkdown(`
💱 *Exchange Rate (live)*

*1 USD = ${rate.toLocaleString()} KHR*

Usage examples:
\`/currency 10\`        → converts $10 → KHR
\`/currency 40000 khr\` → converts 40,000 KHR → USD
      `)
    } catch (err) {
      return ctx.reply('Could not fetch exchange rate. Please try again later.')
    }
  }

  const amount = parseFloat(args[0])
  const unit = (args[1] || 'usd').toLowerCase()

  if (isNaN(amount) || amount <= 0) {
    return ctx.reply('Please enter a valid number. Example: /currency 10')
  }

  try {
    const rate = await getUSDtoKHR()

    if (unit === 'khr') {
      const usd = (amount / rate).toFixed(2)
      return ctx.replyWithMarkdown(
        `💱 *${amount.toLocaleString()} KHR* = *$${usd} USD*\n_Rate: 1 USD = ${rate.toLocaleString()} KHR_`
      )
    } else {
      // Default: USD → KHR
      const khr = Math.round(amount * rate)
      return ctx.replyWithMarkdown(
        `💱 *$${amount} USD* = *${khr.toLocaleString()} KHR*\n_Rate: 1 USD = ${rate.toLocaleString()} KHR_`
      )
    }
  } catch (err) {
    return ctx.reply('Could not fetch exchange rate. Please try again later.')
  }
}

module.exports = { handleCurrency }