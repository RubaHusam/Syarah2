'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Vehicle, vehicleService } from '@/lib/vehicles';

interface VehicleViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}

export default function VehicleViewModal({ isOpen, onClose, vehicle }: VehicleViewModalProps) {
  const [travelSegments, setTravelSegments] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle && isOpen) {
      fetchTravelSegments();
    }
  }, [vehicle, isOpen]);

  const fetchTravelSegments = async () => {
    if (!vehicle) return;

    try {
      setLoading(true);
      const response = await vehicleService.getTravelSegments(vehicle.id);
      if (response.success) {
        setTravelSegments(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch travel segments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Vehicle Details - {vehicle.title}
            </Dialog.Title>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vehicle Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
                  
                  {vehicle.image && (
                    <div className="mb-4">
                      <img
                        src={
                          vehicle.image.startsWith('http')
                            ? vehicle.image
                            : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${vehicle.image}`
                        }
                        alt={vehicle.title}
                        className="w-full max-h-64 object-contain rounded-lg border border-gray-300 bg-gray-50"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Title</label>
                      <p className="mt-1 text-sm text-gray-900">{vehicle.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Plate Number</label>
                      <p className="mt-1 text-sm text-gray-900">{vehicle.plate_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Brand</label>
                      <p className="mt-1 text-sm text-gray-900">{vehicle.brand}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Model</label>
                      <p className="mt-1 text-sm text-gray-900">{vehicle.model}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Price</label>
                      <p className="mt-1 text-sm text-gray-900">${vehicle.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Year</label>
                      <p className="mt-1 text-sm text-gray-900">{vehicle.year}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Status</label>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          vehicle.status === 'Published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Total Distance</label>
                      <p className="mt-1 text-sm text-gray-900">{vehicle.total_distance || 0} km</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Travel Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Travel Information</h3>
                  
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : travelSegments && travelSegments.segments && travelSegments.segments.length > 0 ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-500">Total Distance:</span>
                            <p className="text-gray-900">{travelSegments.total_distance_km} km</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Total Segments:</span>
                            <p className="text-gray-900">{travelSegments.total_segments}</p>
                          </div>
                        </div>
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        <h4 className="font-medium text-gray-900 mb-2">Travel Segments</h4>
                        <div className="space-y-3">
                          {travelSegments.segments.map((segment: any, index: number) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                  Segment {index + 1}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {segment.distance_km} km
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                                <div>
                                  <div className="flex items-center">
                                    <MapPinIcon className="h-3 w-3 text-green-500 mr-1" />
                                    <span className="font-medium">Start</span>
                                  </div>
                                  <p>Lat: {segment.start_location.latitude}</p>
                                  <p>Lng: {segment.start_location.longitude}</p>
                                  <p>{new Date(segment.start_location.timestamp).toLocaleString()}</p>
                                </div>
                                <div>
                                  <div className="flex items-center">
                                    <MapPinIcon className="h-3 w-3 text-red-500 mr-1" />
                                    <span className="font-medium">End</span>
                                  </div>
                                  <p>Lat: {segment.end_location.latitude}</p>
                                  <p>Lng: {segment.end_location.longitude}</p>
                                  <p>{new Date(segment.end_location.timestamp).toLocaleString()}</p>
                                </div>
                              </div>
                              {segment.duration_minutes && (
                                <div className="mt-2 text-xs text-gray-500">
                                  Duration: {segment.duration_minutes} minutes
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MapPinIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No travel data available for this vehicle</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
