const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const API_BASE_URL = String(rawBaseUrl).replace(/\/+$/, '');

export { API_BASE_URL };
