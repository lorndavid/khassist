const HOLIDAYS_2025 = [
  { date: 'Jan 1',    name: "International New Year's Day" },
  { date: 'Jan 7',    name: 'Victory Day over Genocidal Regime' },
  { date: 'Mar 8',    name: "International Women's Day" },
  { date: 'Apr 13-15',name: 'Khmer New Year (ចូលឆ្នាំខ្មែរ)' },
  { date: 'May 1',    name: "International Labour Day" },
  { date: 'May 13-15',name: "Royal Ploughing Ceremony" },
  { date: 'May 13',   name: "King Sihamoni's Birthday" },
  { date: 'Jun 1',    name: "International Children's Day" },
  { date: 'Jun 18',   name: "Queen Mother's Birthday" },
  { date: 'Sep 24',   name: 'Constitutional Day' },
  { date: 'Oct 15',   name: 'Commemoration Day of King Father' },
  { date: 'Oct 23',   name: 'Paris Peace Agreement Day' },
  { date: 'Oct 29',   name: "King Sihamoni's Coronation Day" },
  { date: 'Nov 7-9',  name: 'Water Festival (បុណ្យអុំទូក)' },
  { date: 'Nov 9',    name: 'Independence Day' },
  { date: 'Dec 10',   name: 'Human Rights Day' },
]

async function handleHolidays(ctx) {
  const today = new Date()
  const lines = HOLIDAYS_2025.map(h => `📅 *${h.date}* — ${h.name}`)

  await ctx.replyWithMarkdown(
    `🇰🇭 *Cambodia Public Holidays 2025*\n\n${lines.join('\n')}`
  )
}

module.exports = { handleHolidays }