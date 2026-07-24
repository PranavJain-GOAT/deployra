import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

export default api;
