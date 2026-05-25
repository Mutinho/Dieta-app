import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TamaguiProvider } from 'tamagui'
import config from './tamagui.config'
import App from './App'
import './global.css'

function Root() {
  return (
    <TamaguiProvider config={config} defaultTheme="dark">
      <App />
    </TamaguiProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
