import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { tamaguiPlugin } from '@tamagui/vite-plugin'

export default defineConfig({
  base: '/Dieta-app/',
  plugins: [
    react(),
    tamaguiPlugin({
      config: 'src/tamagui.config.ts',
      components: ['tamagui'],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Dieta App',
        short_name: 'Dieta',
        display: 'standalone',
        theme_color: '#4a90d9',
        background_color: '#ffffff',
        icons: [
          { src: '/Icon-180.png', sizes: '180x180', type: 'image/png' },
          { src: '/Icon-1024.png', sizes: '1024x1024', type: 'image/png', purpose: 'any' },
        ],
      },
    }),
  ],
})
