const UMAMI_ORIGIN = 'https://umami-avidx.onrender.com'
const WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID?.trim()
const SCRIPT_SELECTOR = 'script[data-memodee-umami="true"]'

if (import.meta.env.PROD && WEBSITE_ID) {
  // Prevent duplicate injection if module is loaded more than once.
  if (!document.head.querySelector(SCRIPT_SELECTOR)) {
    const script = document.createElement('script')
    script.defer = true
    script.src = `${UMAMI_ORIGIN}/script.js`
    script.setAttribute('data-website-id', WEBSITE_ID)
    script.setAttribute('data-memodee-umami', 'true')
    document.head.appendChild(script)
  }
}