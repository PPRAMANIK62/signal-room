export function getWebEnv() {
  return {
    apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
    signalingUrl: import.meta.env.VITE_SIGNALING_URL ?? "http://localhost:3001",
  };
}
