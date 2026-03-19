import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // FastAPI Backend URL
  timeout: 10000,
});

// Optionally add interceptors here to inject tokens into headers
export default api;
