const UMAMI_ORIGIN = 'https://umami-avidx.onrender.com'
const WEBSITE_ID = '0e8e2993-5f47-477c-b6a0-1a9b1fb70f00'

if (import.meta.env.PROD) {
  const script = document.createElement('script')
  script.defer = true
  script.src = `${UMAMI_ORIGIN}/script.js`
  script.setAttribute('data-website-id', WEBSITE_ID)
  document.head.appendChild(script)
}