import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TamaguiProvider } from 'tamagui'
import config from './tamagui.config'
import App from './App'
import './global.css'

function Root() {
  const scheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  return (
    <TamaguiProvider config={config} defaultTheme={scheme}>
      <App />
    </TamaguiProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
