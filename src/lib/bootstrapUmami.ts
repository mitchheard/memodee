const UMAMI_ORIGIN = 'https://umami-avidx.onrender.com'
const SCRIPT_SELECTOR = 'script[data-memodee-umami="true"]'

/**
 * Loads the Umami tracker in production when `VITE_UMAMI_WEBSITE_ID` was present
 * at **build** time (Vite inlines `import.meta.env`). Safe to call more than once.
 */
export function bootstrapUmami(): void {
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID?.trim()

  if (import.meta.env.PROD && !websiteId) {
    console.warn(
      '[Memodee] Umami: VITE_UMAMI_WEBSITE_ID was not set when the app was built; analytics are disabled.',
    )
    return
  }

  if (!import.meta.env.PROD || !websiteId) return

  if (document.head.querySelector(SCRIPT_SELECTOR)) return

  const script = document.createElement('script')
  script.defer = true
  script.src = `${UMAMI_ORIGIN}/script.js`
  script.setAttribute('data-website-id', websiteId)
  script.setAttribute('data-memodee-umami', 'true')
  document.head.appendChild(script)
}
