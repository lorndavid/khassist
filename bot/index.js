const { Telegraf } = require('telegraf')
const express = require('express')
const { handleStart } = require('./commands/start')
const { handleCurrency } = require('./commands/currency')
const { handleWeather } = require('./commands/weather')
const { handleEmergency } = require('./commands/emergency')
const { handleHolidays } = require('./commands/holidays')
const { loanScene, handleLoanReply } = require('./commands/loan')
const { logUserToDB } = require('./db/neon')
require('dotenv').config()

// ─── Validate env ────────────────────────────────────────────────────────────
const { BOT_TOKEN, WEBHOOK_DOMAIN, PORT = 3000 } = process.env
if (!BOT_TOKEN) throw new Error('BOT_TOKEN is missing in .env')
if (!WEBHOOK_DOMAIN) throw new Error('WEBHOOK_DOMAIN is missing in .env')

// ─── Bot setup ───────────────────────────────────────────────────────────────
const bot = new Telegraf(BOT_TOKEN)

// ─── Middleware: log every user to Neon DB ───────────────────────────────────
bot.use(async (ctx, next) => {
  if (ctx.from) {
    await logUserToDB({
      telegram_id: ctx.from.id,
      username: ctx.from.username || null,
      first_name: ctx.from.first_name || null,
      last_name: ctx.from.last_name || null,
    }).catch(err => console.error('DB log error:', err))
  }
  return next()
})

// ─── Commands ─────────────────────────────────────────────────────────────────
bot.start(handleStart)
bot.command('currency', handleCurrency)
bot.command('weather', handleWeather)
bot.command('emergency', handleEmergency)
bot.command('holidays', handleHolidays)
bot.command('loan', loanScene)

// ─── Help command ─────────────────────────────────────────────────────────────
bot.command('help', (ctx) => {
  ctx.replyWithMarkdown(`
*KhmerAssist Bot* 🇰🇭 — Your Cambodia daily helper

/currency — KHR ↔ USD converter
/weather  — Phnom Penh weather
/loan     — Microfinance loan calculator
/holidays — Khmer public holidays
/emergency — Emergency contact numbers
/help     — Show this menu
  `)
})

// ─── Handle text (catches loan multi-step replies + fallback) ─────────────────
bot.on('text', async (ctx) => {
  const handled = await handleLoanReply(ctx)
  if (!handled) {
    ctx.reply('Please use the menu. Type /help to see all commands.')
  }
})

// ─── Express server (for Render webhook) ─────────────────────────────────────
const app = express()
app.use(express.json())

// Telegram sends POST updates to this path
const WEBHOOK_PATH = `/webhook/${BOT_TOKEN}`
app.post(WEBHOOK_PATH, (req, res) => {
  bot.handleUpdate(req.body, res)
})

// Health check — Render pings this to keep the service awake
app.get('/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }))

// ─── Start server + register webhook ─────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)

  const webhookURL = `${WEBHOOK_DOMAIN}${WEBHOOK_PATH}`
  try {
    await bot.telegram.setWebhook(webhookURL)
    console.log(`Webhook set: ${webhookURL}`)
  } catch (err) {
    console.error('Failed to set webhook:', err.message)
  }
})

// ─── Graceful shutdown ────────────────────────────────────────────────────────
process.once('SIGINT', () => {
  try { bot.stop('SIGINT') } catch {}
  process.exit(0)
})
process.once('SIGTERM', () => {
  try { bot.stop('SIGTERM') } catch {}
  process.exit(0)
})