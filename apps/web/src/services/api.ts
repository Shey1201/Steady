// Base API client
const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE}${endpoint}`;
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const duration = Date.now() - startTime;
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        console.error(`[API Error] ${options.method || 'GET'} ${url} - ${response.status} (${duration}ms)`, data);
        throw new ApiError(response.status, data.error || 'Request failed', data);
    }
    
    // Log successful requests in development or if needed
    if (import.meta.env?.DEV) {
        console.log(`[API Success] ${options.method || 'GET'} ${url} - ${response.status} (${duration}ms)`);
    }

    return data as T;
  } catch (error) {
    // Network errors or other fetch failures
    if (error instanceof ApiError) {
        throw error;
    }
    
    console.error(`[API Network Error] ${options.method || 'GET'} ${url}`, error);
    throw new ApiError(0, error instanceof Error ? error.message : 'Network error', error);
  }
}

export const api = {
  get: <T>(url: string) => request<T>(url, { method: 'GET' }),
  post: <T>(url: string, body: any) => request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: any) => request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};
