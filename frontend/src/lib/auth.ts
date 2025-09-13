import api from './api';
import Cookies from 'js-cookie';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    if (response.data.success) {
      Cookies.set('token', response.data.token, { expires: 7 });
      Cookies.set('user', JSON.stringify(response.data.user), { expires: 7 });
    }
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    if (response.data.success) {
      Cookies.set('token', response.data.token, { expires: 7 });
      Cookies.set('user', JSON.stringify(response.data.user), { expires: 7 });
    }
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('token');
      Cookies.remove('user');
    }
  },

  async getProfile(): Promise<{ success: boolean; user: User }> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  getUser(): User | null {
    const userCookie = Cookies.get('user');
    return userCookie ? JSON.parse(userCookie) : null;
  },

  getToken(): string | null {
    return Cookies.get('token') || null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
