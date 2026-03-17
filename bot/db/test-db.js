// ─── Local DB Test Script ─────────────────────────────────────────────────────
// Run: node bot/db/test-db.js
// This checks your Neon connection and all tables are working.

require('dotenv').config()
const { neon } = require('@neondatabase/serverless')

async function runTests() {
  console.log('\n🔌 Connecting to Neon PostgreSQL...')
  console.log(`   URL: ${process.env.DATABASE_URL?.slice(0, 40)}...`)

  const sql = neon(process.env.DATABASE_URL)

  // ── Test 1: Basic connection ─────────────────────────────────────────────
  console.log('\n📡 Test 1: Basic connection')
  const ping = await sql`SELECT NOW() AS time, version() AS pg_version`
  console.log('   ✅ Connected!')
  console.log(`   Time: ${ping[0].time}`)
  console.log(`   PostgreSQL: ${ping[0].pg_version.split(' ').slice(0,2).join(' ')}`)

  // ── Test 2: Check tables exist ───────────────────────────────────────────
  console.log('\n📋 Test 2: Check tables')
  const tables = await sql`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `
  const expected = ['command_logs', 'fx_rates', 'rice_prices', 'users']
  expected.forEach(t => {
    const found = tables.some(r => r.tablename === t)
    console.log(`   ${found ? '✅' : '❌'} Table: ${t}`)
  })

  // ── Test 3: Insert a test user ───────────────────────────────────────────
  console.log('\n👤 Test 3: Insert test user')
  await sql`
    INSERT INTO users (telegram_id, username, first_name)
    VALUES (9999999999, 'test_user', 'Test')
    ON CONFLICT (telegram_id) DO UPDATE SET last_seen = NOW()
  `
  const user = await sql`SELECT * FROM users WHERE telegram_id = 9999999999`
  console.log(`   ✅ Upserted user: ${user[0].first_name} (id: ${user[0].telegram_id})`)

  // ── Test 4: Log a command ────────────────────────────────────────────────
  console.log('\n📝 Test 4: Log a command')
  await sql`
    INSERT INTO command_logs (telegram_id, command, payload)
    VALUES (9999999999, '/currency', '10 usd')
  `
  const logs = await sql`
    SELECT * FROM command_logs WHERE telegram_id = 9999999999
  `
  console.log(`   ✅ Command logged: ${logs[0].command} (payload: ${logs[0].payload})`)

  // ── Test 5: Rice prices seed data ───────────────────────────────────────
  console.log('\n🍚 Test 5: Rice prices')
  const rice = await sql`SELECT * FROM rice_prices ORDER BY variety`
  if (rice.length > 0) {
    rice.forEach(r => {
      console.log(`   ✅ ${r.variety}: $${r.price_usd} / ${r.price_khr} KHR`)
    })
  } else {
    console.log('   ⚠️  No rice prices found — run the migration SQL first!')
  }

  // ── Test 6: FX rate insert ───────────────────────────────────────────────
  console.log('\n💱 Test 6: FX rate insert')
  await sql`
    INSERT INTO fx_rates (base, target, rate)
    VALUES ('USD', 'KHR', 4100)
  `
  const fx = await sql`
    SELECT * FROM fx_rates WHERE base = 'USD' AND target = 'KHR'
    ORDER BY fetched_at DESC LIMIT 1
  `
  console.log(`   ✅ FX rate: 1 ${fx[0].base} = ${fx[0].rate} ${fx[0].target}`)

  // ── Cleanup test data ────────────────────────────────────────────────────
  console.log('\n🧹 Cleaning up test data...')
  await sql`DELETE FROM command_logs WHERE telegram_id = 9999999999`
  await sql`DELETE FROM fx_rates WHERE base = 'USD' AND target = 'KHR'`
  await sql`DELETE FROM users WHERE telegram_id = 9999999999`
  console.log('   ✅ Test data removed')

  console.log('\n🎉 All tests passed! Your Neon DB is ready.\n')
}

runTests().catch(err => {
  console.error('\n❌ Test failed:', err.message)
  console.error('\nTips:')
  console.error('  1. Make sure .env has DATABASE_URL set correctly')
  console.error('  2. Make sure you ran 001_init.sql in the Neon SQL Editor')
  console.error('  3. Check your Neon dashboard — is the project active?\n')
  process.exit(1)
})