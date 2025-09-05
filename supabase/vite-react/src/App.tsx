import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  // ✅ Inject analytics scripts on mount
  useEffect(() => {
    if (import.meta.env.VITE_ENABLE_GA4 === 'true') {
      const gtagScript = document.createElement('script')
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA4_ID}`
      gtagScript.async = true
      document.head.appendChild(gtagScript)

      const gtagInit = document.createElement('script')
      gtagInit.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${import.meta.env.VITE_GA4_ID}');
      `
      document.head.appendChild(gtagInit)
    }

    if (import.meta.env.VITE_ENABLE_PLAUSIBLE === 'true') {
      const plausibleScript = document.createElement('script')
      plausibleScript.setAttribute('defer', '')
      plausibleScript.setAttribute('data-domain', import.meta.env.VITE_PLAUSIBLE_DOMAIN || 'cauverystore.in')
      plausibleScript.src = 'https://plausible.io/js/script.js'
      document.head.appendChild(plausibleScript)
    }
  }, [])

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
