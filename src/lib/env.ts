export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  useMock: import.meta.env.VITE_USE_MOCK === 'true',
} as const;