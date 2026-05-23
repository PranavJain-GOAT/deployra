export const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Dynamic host-aware fallback for cross-origin deployments without dashboard env variables
  const isLocal = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' || 
     window.location.hostname.startsWith('192.168.'));
  
  return isLocal ? 'http://localhost:5001/api/v1' : 'https://deployra.onrender.com/api/v1';
};

export const API_URL = getApiUrl();
