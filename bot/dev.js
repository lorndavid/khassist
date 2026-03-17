// LOCAL DEVELOPMENT ONLY — uses polling, not webhook
// Run with: npm run dev
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

const { Telegraf } = require('telegraf')
const { handleStart }    = require('./commands/start')
const { handleCurrency } = require('./commands/currency')
const { handleWeather }  = require('./commands/weather')
const { handleEmergency }= require('./commands/emergency')
const { handleHolidays } = require('./commands/holidays')
const { handlePrices }   = require('./commands/prices')
const { loanScene, handleLoanReply } = require('./commands/loan')
const { logUserToDB }    = require('./db/neon')

if (!process.env.BOT_TOKEN) {
  console.error('ERROR: BOT_TOKEN is missing in your .env file')
  process.exit(1)
}

const bot = new Telegraf(process.env.BOT_TOKEN)

// Middleware: log every user to Neon DB
bot.use(async (ctx, next) => {
  if (ctx.from) {
    // ctx.from.id is the Telegram user ID
    await logUserToDB(ctx.from).catch(err =>
      console.error('DB log error:', err.message)
    )
  }
  return next()
})

// Commands
bot.start(handleStart)
bot.command('currency',  handleCurrency)
bot.command('weather',   handleWeather)
bot.command('emergency', handleEmergency)
bot.command('holidays',  handleHolidays)
bot.command('prices',    handlePrices)
bot.command('loan',      loanScene)
bot.command('help', ctx => ctx.replyWithMarkdown(`
*KhmerAssist Bot* 🇰🇭 — Cambodia daily helper

/currency  — KHR ↔ USD converter
/weather   — Phnom Penh weather
/loan      — Loan calculator
/prices    — Rice market prices
/holidays  — Public holidays 2025
/emergency — Emergency numbers
`))

// Catch multi-step loan replies + unknown messages
bot.on('text', async ctx => {
  const handled = await handleLoanReply(ctx)
  if (!handled) ctx.reply('Use /help to see all commands.')
})

// Start polling (works on localhost without a public URL)
bot.launch({ dropPendingUpdates: true })
  .then(() => {
    console.log('Bot is running in polling mode!')
    console.log('Open Telegram and message your bot to test.')
  })
  .catch(err => {
    console.error('Failed to start bot:', err.message)
    if (err.message.includes('401')) {
      console.error('Your BOT_TOKEN is wrong. Check .env and copy it again from @BotFather.')
    }
  })

process.once('SIGINT',  () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))