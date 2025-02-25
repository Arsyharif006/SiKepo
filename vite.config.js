import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: 'https://github.com/Arsyharif006/SiKepo.git', // Ganti dengan nama repository GitHub Anda
});
