async function handleStart(ctx) {
  const name = ctx.from.first_name || 'there'

  await ctx.replyWithMarkdown(`
👋 *សួស្តី ${name}! Hello ${name}!*

Welcome to *KhmerAssist Bot* 🇰🇭
Your everyday Cambodia companion.

*What I can do for you:*

💱 /currency — Convert KHR ↔ USD
🌤 /weather  — Phnom Penh weather
🏦 /loan     — Loan & interest calculator
📅 /holidays — Khmer public holidays 2025
🚨 /emergency — Emergency contact numbers
❓ /help     — Show this menu again

_Built for everyday life in Cambodia._
  `)
}

module.exports = { handleStart }