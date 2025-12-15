import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Permite acceder como tesla.localhost:5173
    host: true, 
    allowedHosts: ['.localhost'], 
    proxy: {
      '/api': {
        // Nombre del servicio backend en Docker (o localhost:8000 si corres local sin docker para el back)
        target: 'http://db:8000', 
        changeOrigin: true,
        // En algunos entornos Docker es necesario reescribir el host
        // configure: (proxy, options) => {
        //   proxy.on('proxyReq', (proxyReq, req, res) => {
        //     proxyReq.setHeader('Host', 'localhost:8000'); 
        //   });
        // }
      }
    }
  }
});