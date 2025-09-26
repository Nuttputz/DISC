import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If your GitHub repo name is different, change base to `/<your-repo>/`
export default defineConfig({
  plugins: [react()],
  base: '/DISC/',
})
