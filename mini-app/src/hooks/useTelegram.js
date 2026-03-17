import { useEffect } from 'react'

// Access the Telegram Web App SDK injected by index.html
const tg = window.Telegram?.WebApp

export function useTelegram() {
  useEffect(() => {
    if (!tg) return
    // Tell Telegram the app is ready — hides the loading spinner
    tg.ready()
    // Expand to full screen height inside Telegram
    tg.expand()
  }, [])

  // The user who opened the Mini App
  const user = tg?.initDataUnsafe?.user ?? null

  // Close the Mini App
  const close = () => tg?.close()

  // Show the Telegram back button
  const showBackButton = (onBack) => {
    if (!tg?.BackButton) return
    tg.BackButton.show()
    tg.BackButton.onClick(onBack)
  }

  const hideBackButton = () => {
    if (!tg?.BackButton) return
    tg.BackButton.hide()
    tg.BackButton.offClick()
  }

  // Show Telegram's native alert
  const alert = (msg) => tg?.showAlert?.(msg)

  // Haptic feedback (feels native on iOS/Android)
  const haptic = (type = 'light') => tg?.HapticFeedback?.impactOccurred(type)

  // Is the Mini App actually running inside Telegram?
  const isInTelegram = Boolean(tg?.initData)

  return { tg, user, close, showBackButton, hideBackButton, alert, haptic, isInTelegram }
}