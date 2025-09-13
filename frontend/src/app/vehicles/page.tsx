'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { vehicleService, Vehicle, VehicleFilters } from '@/lib/vehicles';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, PencilIcon, TrashIcon, MapPinIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import VehicleModal from '@/components/VehicleModal';
import VehicleViewModal from '@/components/VehicleViewModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import GoogleMapModal from '@/components/GoogleMapModal';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<any>(null);
  const [filters, setFilters] = useState<VehicleFilters>({
    page: 1,
    per_page: 10,
    sort_by: 'created_at',
    sort_order: 'desc',
    include_deleted: false,
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, [filters]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getVehicles(filters);
      if (response.success) {
        setVehicles(response.data.data);
        setPagination(response.data);
      } else {
        setError('Failed to fetch vehicles');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof VehicleFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1, // Reset to page 1 when changing filters
    }));
  };

  const handleSort = (column: string) => {
    const newSortOrder = filters.sort_by === column && filters.sort_order === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({
      ...prev,
      sort_by: column,
      sort_order: newSortOrder,
    }));
  };

  const handleCreate = () => {
    setSelectedVehicle(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditModalOpen(true);
  };

  const handleView = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsViewModalOpen(true);
  };

  const handleDelete = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteModalOpen(true);
  };

  const handleAddLocation = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsMapModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVehicle) return;

    try {
      await vehicleService.deleteVehicle(selectedVehicle.id);
      setIsDeleteModalOpen(false);
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const handleRestore = async (vehicle: Vehicle) => {
    try {
      await vehicleService.restoreVehicle(vehicle.id);
      fetchVehicles();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to restore vehicle');
    }
  };

  const handleModalSuccess = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsMapModalOpen(false);
    setSelectedVehicle(null);
    fetchVehicles();
  };

  const getSortIcon = (column: string) => {
    if (filters.sort_by !== column) return '↕️';
    return filters.sort_order === 'asc' ? '↑' : '↓';
  };

  if (loading && vehicles.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your fleet vehicles
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Vehicle
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Published">Published</option>
                <option value="Not Published">Not Published</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                placeholder="Filter by brand"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={filters.brand || ''}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Per Page
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={filters.per_page || 10}
                onChange={(e) => handleFilterChange('per_page', parseInt(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Show Deleted
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={filters.include_deleted || false}
                  onChange={(e) => handleFilterChange('include_deleted', e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700">Include deleted vehicles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('title')}
                  >
                    Title {getSortIcon('title')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('plate_number')}
                  >
                    Plate Number {getSortIcon('plate_number')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('brand')}
                  >
                    Brand {getSortIcon('brand')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('model')}
                  >
                    Model {getSortIcon('model')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('price')}
                  >
                    Price {getSortIcon('price')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('year')}
                  >
                    Year {getSortIcon('year')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    Status {getSortIcon('status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance (km)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className={`hover:bg-gray-50 ${(vehicle as any).deleted_at ? 'bg-red-50 opacity-75' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vehicle.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.image ? (
                        <div className="relative">
                          <img
                            src={vehicle.image.startsWith('http') ? vehicle.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${vehicle.image}`}
                            alt={vehicle.title}
                            className="h-10 w-16 rounded object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="h-10 w-16 rounded bg-gray-200 flex items-center justify-center">
                                    <span class="text-xs text-gray-500">Error</span>
                                  </div>
                                `;
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-16 rounded bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.plate_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${vehicle.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          vehicle.status === 'Published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.total_distance || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.user?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {(vehicle as any).deleted_at ? (
                          <button
                            onClick={() => handleRestore(vehicle)}
                            className="text-green-600 hover:text-green-900"
                            title="Restore"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleView(vehicle)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(vehicle)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAddLocation(vehicle)}
                              className="text-green-600 hover:text-green-900"
                              title="Add GPS Location"
                            >
                              <MapPinIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(vehicle)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handleFilterChange('page', pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handleFilterChange('page', pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.last_page}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{pagination.from || 0}</span>
                    {' '}to{' '}
                    <span className="font-medium">{pagination.to || 0}</span>
                    {' '}of{' '}
                    <span className="font-medium">{pagination.total}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handleFilterChange('page', pagination.current_page - 1)}
                      disabled={pagination.current_page <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handleFilterChange('page', page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.current_page === page
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handleFilterChange('page', pagination.current_page + 1)}
                      disabled={pagination.current_page >= pagination.last_page}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <VehicleModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleModalSuccess}
          vehicle={null}
          title="Add New Vehicle"
        />

        <VehicleModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleModalSuccess}
          vehicle={selectedVehicle}
          title="Edit Vehicle"
        />

        <VehicleViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          vehicle={selectedVehicle}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Vehicle"
          message={`Are you sure you want to delete "${selectedVehicle?.title}"? This action cannot be undone.`}
        />

        <GoogleMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          vehicle={selectedVehicle}
        />
      </div>
    </Layout>
  );
}
