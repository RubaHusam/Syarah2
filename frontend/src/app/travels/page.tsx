'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { vehicleService } from '@/lib/vehicles';
import { MapPinIcon, TruckIcon } from '@heroicons/react/24/outline';

export default function TravelsPage() {
  const [travels, setTravels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTravels();
  }, []);

  const fetchTravels = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getAllTravels();
      if (response.success) {
        setTravels(response.data);
      } else {
        setError('Failed to fetch travels');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Travel History</h1>
          <p className="mt-1 text-sm text-gray-600">
            View all vehicle travels with calculated distances
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {travels.length === 0 ? (
          <div className="text-center py-12">
            <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No travels found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add GPS locations to your vehicles to see travel data here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {travels.map((travel, index) => (
              <div key={index} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {travel.vehicle.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {travel.vehicle.brand} {travel.vehicle.model} - {travel.vehicle.plate_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-indigo-600">
                        {travel.total_distance_km} km
                      </p>
                      <p className="text-sm text-gray-500">
                        {travel.segments_count} segments
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Travel Segments</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {travel.segments.map((segment: any, segmentIndex: number) => (
                      <div key={segmentIndex} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Segment {segmentIndex + 1}
                          </span>
                          <span className="text-sm font-semibold text-green-600">
                            {segment.distance_km} km
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center text-xs text-gray-600">
                              <MapPinIcon className="h-3 w-3 text-green-500 mr-1" />
                              <span className="font-medium">Start Location</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Lat: {segment.start_location.latitude}
                            </p>
                            <p className="text-xs text-gray-500">
                              Lng: {segment.start_location.longitude}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(segment.start_location.timestamp).toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center text-xs text-gray-600">
                              <MapPinIcon className="h-3 w-3 text-red-500 mr-1" />
                              <span className="font-medium">End Location</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Lat: {segment.end_location.latitude}
                            </p>
                            <p className="text-xs text-gray-500">
                              Lng: {segment.end_location.longitude}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(segment.end_location.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
