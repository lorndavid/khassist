const { getPhnomPenhWeather } = require('../services/weather')
const { logCommand } = require('../db/neon')

async function handleWeather(ctx) {
  await logCommand(ctx.from, 'weather').catch(() => {})

  // Check key is configured first
  if (!process.env.OPENWEATHER_KEY || process.env.OPENWEATHER_KEY === 'your_openweather_api_key') {
    return ctx.replyWithMarkdown(`
*Weather unavailable*

OPENWEATHER\\_KEY is not set in your .env file.

1. Go to openweathermap.org and sign up free
2. Copy your API key
3. Add it to .env: \`OPENWEATHER_KEY=your_key_here\`
4. Restart the bot: \`npm run dev\`

_New keys take ~10 minutes to activate after sign-up._
    `)
  }

  try {
    const w = await getPhnomPenhWeather()
    await ctx.replyWithMarkdown(`
${w.icon} *Weather in Phnom Penh*

Temperature: *${w.temp}°C* (feels like ${w.feels}°C)
Humidity: *${w.humidity}%*
Wind: *${w.wind} m/s*
Condition: *${w.detail}*

_Updated every 30 minutes_
    `)
  } catch (err) {
    const msg = err.response?.status === 401
      ? 'API key is invalid or not yet active.\n\nNew OpenWeatherMap keys take up to 10 minutes to activate. Please wait and try again.'
      : 'Could not fetch weather right now. Please try again in a moment.'

    console.error('Weather error:', err.message)
    await ctx.reply(msg)
  }
}

module.exports = { handleWeather }