import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/SiKepo/', // Ganti dengan nama repository GitHub Anda
});
