export const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  APP_NAME: 'HealthyConnect',
  VERSION: '1.0.0',
  ENVIRONMENT: import.meta.env.MODE || 'development',
} as const;

export default config;
