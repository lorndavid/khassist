async function handleEmergency(ctx) {
  await ctx.replyWithMarkdown(`
🚨 *Cambodia Emergency Numbers*

🚔 Police:        *117*
🔥 Fire:          *118*
🚑 Ambulance:     *119*
🏥 Tourist Police: *012 942 484*
🇺🇸 US Embassy:   *+855 23 728 000*
🏨 Calmette Hospital: *023 426 948*

_In Phnom Penh, dialing 112 also works for general emergencies._
  `)
}

module.exports = { handleEmergency }