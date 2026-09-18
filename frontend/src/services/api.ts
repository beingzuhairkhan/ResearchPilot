import axios, { type AxiosError, type AxiosInstance } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. The server may be busy.'));
    }
    if (!error.response) {
      return Promise.reject(new Error('Unable to reach the server. Please check your connection.'));
    }
    const message = error.response.data?.message || `Request failed with status ${error.response.status}`;
    return Promise.reject(new Error(message));
  },
);

export { baseURL };
