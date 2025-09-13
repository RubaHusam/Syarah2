'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { vehicleService, Vehicle, VehicleFormData } from '@/lib/vehicles';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicle: Vehicle | null;
  title: string;
}

export default function VehicleModal({ isOpen, onClose, onSuccess, vehicle, title }: VehicleModalProps) {
  const [formData, setFormData] = useState<VehicleFormData>({
    title: '',
    plate_number: '',
    brand: '',
    model: '',
    price: 0,
    year: new Date().getFullYear(),
    status: 'Not Published',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        title: vehicle.title,
        plate_number: vehicle.plate_number,
        brand: vehicle.brand,
        model: vehicle.model,
        price: vehicle.price,
        year: vehicle.year,
        status: vehicle.status,
        image_url: vehicle.image || '',
      });
      if (vehicle.image) {
        // Check if it's a URL or a file path
        const imageUrl = vehicle.image.startsWith('http') 
          ? vehicle.image 
          : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${vehicle.image}`;
        setImagePreview(imageUrl);
      }
    } else {
      setFormData({
        title: '',
        plate_number: '',
        brand: '',
        model: '',
        price: 0,
        year: new Date().getFullYear(),
        status: 'Not Published',
        image_url: '',
      });
      setImagePreview(null);
    }
    setImageError(false);
    setError('');
  }, [vehicle, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (vehicle) {
        await vehicleService.updateVehicle(vehicle.id, formData);
      } else {
        await vehicleService.createVehicle(formData);
      }
      onSuccess();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'An error occurred';
      const errors = err.response?.data?.errors;
      
      if (errors) {
        const errorMessages = Object.values(errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, image_url: url }));
    
    if (url) {
      setImagePreview(url);
      setImageError(false);
    } else {
      setImagePreview(null);
      setImageError(false);
    }
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleClose = () => {
    setError('');
    setImagePreview(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              {title}
            </Dialog.Title>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={handleClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="plate_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Plate Number *
                </label>
                <input
                  type="text"
                  id="plate_number"
                  name="plate_number"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.plate_number}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.brand}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  Model *
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.model}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.year}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Published">Published</option>
                  <option value="Not Published">Not Published</option>
                </select>
              </div>

              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  placeholder="https://example.com/image.jpg"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.image_url || ''}
                  onChange={handleImageUrlChange}
                />
                {imageError && (
                  <p className="mt-1 text-sm text-red-600">
                    Failed to load image. Please check the URL.
                  </p>
                )}
              </div>

              {imagePreview && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Preview
                  </label>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-md border border-gray-300"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : vehicle ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
