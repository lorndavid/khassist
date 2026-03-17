// Simple step-by-step loan calculator using ctx.session state
// (No Telegraf Scenes needed — uses plain session steps for simplicity)

const sessions = new Map()

function calcLoan(principal, annualRatePercent, months) {
  const r = annualRatePercent / 100 / 12
  if (r === 0) return { monthly: principal / months, total: principal, interest: 0 }
  const monthly = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
  const total = monthly * months
  const interest = total - principal
  return {
    monthly: Math.round(monthly),
    total: Math.round(total),
    interest: Math.round(interest),
  }
}

async function loanScene(ctx) {
  const id = ctx.from.id
  sessions.set(id, { step: 1 })
  await ctx.reply(
    '🏦 Loan Calculator\n\nStep 1 of 3\nEnter the loan amount in USD (e.g. 500):'
  )
}

// Call this from the main text handler
async function handleLoanReply(ctx) {
  const id = ctx.from.id
  const session = sessions.get(id)
  if (!session) return false // Not in a loan session

  const text = ctx.message.text.trim()

  if (session.step === 1) {
    const amount = parseFloat(text)
    if (isNaN(amount) || amount <= 0)
      return ctx.reply('Please enter a valid amount (e.g. 500):')
    session.amount = amount
    session.step = 2
    sessions.set(id, session)
    return ctx.reply('Step 2 of 3\nEnter the annual interest rate % (e.g. 18 for 18%):')
  }

  if (session.step === 2) {
    const rate = parseFloat(text)
    if (isNaN(rate) || rate < 0 || rate > 200)
      return ctx.reply('Please enter a valid rate between 0 and 200 (e.g. 18):')
    session.rate = rate
    session.step = 3
    sessions.set(id, session)
    return ctx.reply('Step 3 of 3\nEnter loan duration in months (e.g. 12 for 1 year):')
  }

  if (session.step === 3) {
    const months = parseInt(text)
    if (isNaN(months) || months < 1 || months > 360)
      return ctx.reply('Please enter months between 1 and 360 (e.g. 12):')

    sessions.delete(id) // Clear session

    const { monthly, total, interest } = calcLoan(session.amount, session.rate, months)
    const khrRate = 4100 // approximate, ideally fetch live rate
    const monthlyKHR = (monthly * khrRate).toLocaleString()
    const totalKHR = (total * khrRate).toLocaleString()

    return ctx.replyWithMarkdown(`
🏦 *Loan Calculation Result*

💵 Loan amount: *$${session.amount.toLocaleString()}*
📈 Annual rate: *${session.rate}%*
📅 Duration: *${months} months*

─────────────────────
💳 Monthly payment: *$${monthly.toLocaleString()}* (~${monthlyKHR} KHR)
💰 Total repaid: *$${total.toLocaleString()}* (~${totalKHR} KHR)
💸 Total interest: *$${interest.toLocaleString()}*
─────────────────────

_Common Cambodia lenders: ACLEDA, AMK, Prasac, Wing_
Type /loan to calculate again.
    `)
  }

  return false
}

module.exports = { loanScene, handleLoanReply }