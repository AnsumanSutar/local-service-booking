import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add a request interceptor for debugging
api.interceptors.request.use(config => {
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`, config.params || '');
    return config;
});

export default api;
