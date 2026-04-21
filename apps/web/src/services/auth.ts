import { api } from './api';

export interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const data = await api.post<AuthResponse>('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data.user;
  },

  async register(email: string, password: string, name?: string): Promise<User> {
    const data = await api.post<AuthResponse>('/auth/register', { email, password, name });
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data.user;
  },

  logout() {
    localStorage.removeItem('auth_token');
  }
};
