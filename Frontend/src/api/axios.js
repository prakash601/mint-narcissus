import axios from 'axios';
import { logout } from '../store/authSlice';
import { setCorrelationId, getCorrelationId, createLogger } from '../lib/logger';

const log = createLogger('api');

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Auth is via httpOnly cookie (withCredentials:true). Do not send
    // Authorization Bearer or x-user-id headers derived from localStorage —
    // they are XSS-exfiltratable and server trusts only the cookie.
    const correlationId = getCorrelationId();
    if (correlationId) {
      config.headers['x-request-id'] = correlationId;
    }

    log.debug('API request', {
      request: { method: config.method?.toUpperCase(), url: config.url },
    });

    return config;
  },
  (error) => {
    log.error('Request setup failed', error);
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    const correlationId = response.headers['x-request-id'];
    if (correlationId) {
      setCorrelationId(correlationId);
    }

    const responseData = response.data;
    if (responseData && typeof responseData === 'object' && 'success' in responseData) {
      const { success, message, code } = responseData;
      if (success === false) {
        const error = new Error(message || 'Request failed');
        error.code = code;
        error.response = response;
        throw error;
      }
    }

    log.debug('API response', {
      request: {
        method: response.config?.method?.toUpperCase(),
        url: response.config?.url,
        status: response.status,
      },
    });

    return response;
  },
  async (error) => {
    if (error.response) {
      const correlationId = error.response.headers['x-request-id'];
      if (correlationId) {
        setCorrelationId(correlationId);
      }

      const { status, config } = error.response;
      const method = config?.method?.toUpperCase();
      const url = config?.url;

      if (status === 401) {
        // Don't auto-logout on the session-check endpoint itself — that
        // creates an infinite logout loop when the user is just unauthenticated
        const isAuthMe = typeof url === 'string' && url.includes('/auth/me');
        if (!isAuthMe) {
          const { store } = await import('../store/store');
          store.dispatch(logout());
        }
      }

      log.error('API error', error, {
        request: { method, url, status },
      });
    } else if (error.request) {
      log.error('Network error', error, { meta: { message: 'No response received' } });
    } else {
      log.error('Request configuration error', error);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
