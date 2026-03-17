const { getRicePrices } = require('../db/neon')
const { logCommand } = require('../db/neon')

async function handlePrices(ctx) {
  await logCommand(ctx.from.id, 'prices').catch(() => {})

  try {
    const prices = await getRicePrices()

    if (!prices || prices.length === 0) {
      return ctx.reply('No price data available right now. Please check back later.')
    }

    const lines = prices.map(p =>
      `🌾 *${p.variety}*\n   $${Number(p.price_usd).toFixed(2)}/kg — ${Number(p.price_khr).toLocaleString()} KHR/kg`
    ).join('\n\n')

    const updatedAt = new Date(prices[0].updated_at).toLocaleDateString('en-KH', {
      year: 'numeric', month: 'short', day: 'numeric'
    })

    await ctx.replyWithMarkdown(`
🍚 *Rice Market Prices*
📍 ${prices[0].market}

${lines}

_Last updated: ${updatedAt}_
_Source: Phnom Penh Central Market_
    `)
  } catch (err) {
    console.error('Prices error:', err.message)
    ctx.reply('Could not load prices. Please try again later.')
  }
}

module.exports = { handlePrices }