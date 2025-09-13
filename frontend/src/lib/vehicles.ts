import api from './api';

export interface Vehicle {
  id: number;
  user_id: number;
  title: string;
  image?: string;
  plate_number: string;
  brand: string;
  model: string;
  price: number;
  year: number;
  status: 'Published' | 'Not Published';
  total_distance?: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  gps_locations?: GpsLocation[];
}

export interface GpsLocation {
  id: number;
  vehicle_id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleFilters {
  page?: number;
  per_page?: number;
  status?: string;
  brand?: string;
  model?: string;
  year?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  include_deleted?: boolean;
}

export interface VehicleFormData {
  title: string;
  plate_number: string;
  brand: string;
  model: string;
  price: number;
  year: number;
  status: 'Published' | 'Not Published';
  image?: File;
  image_url?: string;
}

export interface VehicleStatistics {
  total_vehicles: number;
  vehicles_by_status: {
    Published: number;
    'Not Published': number;
  };
  vehicles_by_brand: Record<string, number>;
}

export const vehicleService = {
  async getVehicles(filters?: VehicleFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/vehicles?${params.toString()}`);
    return response.data;
  },

  async getVehicle(id: number) {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  async createVehicle(data: VehicleFormData) {
    // If using image URL, send as JSON
    if (data.image_url && !data.image) {
      const payload = { ...data, image: data.image_url };
      delete payload.image_url;
      const response = await api.post('/vehicles', payload);
      return response.data;
    }
    
    // If using file upload, send as FormData
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'image_url') {
        formData.append(key, value.toString());
      }
    });
    
    const response = await api.post('/vehicles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateVehicle(id: number, data: Partial<VehicleFormData>) {
    // If using image URL, send as JSON
    if (data.image_url && !data.image) {
      const payload = { ...data, image: data.image_url };
      delete payload.image_url;
      const response = await api.put(`/vehicles/${id}`, payload);
      return response.data;
    }
    
    // If using file upload, send as FormData
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'image_url') {
        formData.append(key, value.toString());
      }
    });
    
    const response = await api.post(`/vehicles/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-HTTP-Method-Override': 'PUT',
      },
    });
    return response.data;
  },

  async deleteVehicle(id: number) {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  async restoreVehicle(id: number) {
    const response = await api.post(`/vehicles/${id}/restore`);
    return response.data;
  },

  async getStatistics(): Promise<{ success: boolean; data: VehicleStatistics }> {
    const response = await api.get('/vehicles-statistics');
    return response.data;
  },

  async getVehicleLocations(vehicleId: number) {
    const response = await api.get(`/vehicles/${vehicleId}/locations`);
    return response.data;
  },

  async getTravelSegments(vehicleId: number) {
    const response = await api.get(`/vehicles/${vehicleId}/travel-segments`);
    return response.data;
  },

  async getAllTravels() {
    const response = await api.get('/travels');
    return response.data;
  },

  async addGpsLocation(data: {
    vehicle_id: number;
    latitude: number;
    longitude: number;
    timestamp?: string;
  }) {
    const response = await api.post('/gps-locations', data);
    return response.data;
  },
};
