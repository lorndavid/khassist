const { Redis } = require('@upstash/redis')
require('dotenv').config()

// Lazy-init so we don't crash if env vars are missing at import time
let redis

function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return redis
}

async function getCache(key) {
  try {
    return await getRedis().get(key)
  } catch (err) {
    console.warn('Cache GET failed:', err.message)
    return null
  }
}

async function setCache(key, value, ttlSeconds = 3600) {
  try {
    await getRedis().set(key, value, { ex: ttlSeconds })
  } catch (err) {
    console.warn('Cache SET failed:', err.message)
  }
}

async function deleteCache(key) {
  try {
    await getRedis().del(key)
  } catch (err) {
    console.warn('Cache DEL failed:', err.message)
  }
}

module.exports = { getCache, setCache, deleteCache }