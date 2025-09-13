import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserFilters {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'admin' | 'user';
}

export const userService = {
  async getUsers(filters?: UserFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  },

  async getUser(id: number) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async createUser(data: CreateUserData) {
    const response = await api.post('/users', data);
    return response.data;
  },

  async updateUser(id: number, data: Partial<CreateUserData>) {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: number) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
