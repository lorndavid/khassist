const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in your .env file')
}

const sql = neon(process.env.DATABASE_URL)

// Accepts ctx.from directly — Telegram sends { id, username, first_name, ... }
// ctx.from.id is what we store as telegram_id
async function logUserToDB(from) {
  const telegram_id = from.id ?? from.telegram_id ?? null
  const username    = from.username   ?? null
  const first_name  = from.first_name ?? null
  const last_name   = from.last_name  ?? null

  if (!telegram_id) {
    console.warn('logUserToDB: telegram_id missing, skipping. Got:', from)
    return
  }

  await sql`
    INSERT INTO users (telegram_id, username, first_name, last_name)
    VALUES (${telegram_id}, ${username}, ${first_name}, ${last_name})
    ON CONFLICT (telegram_id)
    DO UPDATE SET
      username   = EXCLUDED.username,
      first_name = EXCLUDED.first_name,
      last_name  = EXCLUDED.last_name,
      last_seen  = NOW()
  `
}

// Accept either a raw number or ctx.from object
async function logCommand(telegram_id_or_from, command) {
  const tid = typeof telegram_id_or_from === 'object'
    ? (telegram_id_or_from.id ?? telegram_id_or_from.telegram_id)
    : telegram_id_or_from
  if (!tid) return
  await sql`
    INSERT INTO command_logs (telegram_id, command)
    VALUES (${tid}, ${command})
  `
}

async function getUserCount() {
  const result = await sql`SELECT COUNT(*) AS count FROM users`
  return Number(result[0].count)
}

async function getLatestFXRate(base = 'USD', target = 'KHR') {
  try {
    const rows = await sql`
      SELECT rate FROM fx_rates
      WHERE base = ${base} AND target = ${target}
      ORDER BY fetched_at DESC LIMIT 1
    `
    return rows[0]?.rate ?? null
  } catch { return null }
}

async function saveFXRate(base, target, rate) {
  await sql`INSERT INTO fx_rates (base, target, rate) VALUES (${base}, ${target}, ${rate})`
}

async function getRicePrices() {
  return sql`SELECT variety, price_usd, price_khr, market, updated_at FROM rice_prices ORDER BY variety ASC`
}

module.exports = { sql, logUserToDB, logCommand, getUserCount, getLatestFXRate, saveFXRate, getRicePrices }