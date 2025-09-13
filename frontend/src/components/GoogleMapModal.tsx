'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Loader } from '@googlemaps/js-api-loader';
import { vehicleService, Vehicle } from '@/lib/vehicles';

interface GoogleMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}

export default function GoogleMapModal({ isOpen, onClose, vehicle }: GoogleMapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const startMarkerRef = useRef<google.maps.Marker | null>(null);
  const endMarkerRef = useRef<google.maps.Marker | null>(null);
  const [startLocation, setStartLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [endLocation, setEndLocation] = useState<{ lat: number; lng: number } | null>(null);
  const startLocRef = useRef<{ lat: number; lng: number } | null>(null);
  const endLocRef = useRef<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Keep a ref to the loaded google object so we can trigger resize when the modal opens
  const googleRef = useRef<any>(null);
  // Keep a ref to the single map click listener so we can remove it when needed
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Wait a tick to ensure the dialog panel has calculated size before initializing/resizing the map
    const id = window.setTimeout(() => {
      if (mapRef.current) {
        const needsReinit = !map || (map && map.getDiv && map.getDiv() !== mapRef.current);
        if (needsReinit) {
          initializeMap();
        } else if (googleRef.current) {
          // Ensure tiles render correctly when opening in a modal
          googleRef.current.maps.event.trigger(map, 'resize');
          map!.setCenter({ lat: 24.7136, lng: 46.6753 });
        }
      }
    }, 50);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  const initializeMap = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        setError('Google Maps API key is missing. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to frontend/.env.local and restart the dev server.');
        return;
      }

      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places']
      });

      const google = await loader.load();
      googleRef.current = google;
      
      const mapInstance = new google.maps.Map(mapRef.current!, {
        center: { lat: 24.7136, lng: 46.6753 }, // Riyadh, Saudi Arabia
        zoom: 10,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      setMap(mapInstance);

      // Ensure we don't accumulate multiple click listeners
      try {
        google.maps.event.clearInstanceListeners(mapInstance);
      } catch {}
      if (clickListenerRef.current) {
        clickListenerRef.current.remove();
        clickListenerRef.current = null;
      }

      // Add a single click listener to map
      clickListenerRef.current = mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return;
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        // First click sets Start, second sets End; further clicks ignored
        if (!startLocRef.current) {
          const point = { lat, lng };
          setStartLocation(point);
          startLocRef.current = point;
          if (startMarkerRef.current) startMarkerRef.current.setMap(null);
          const sMarker = new google.maps.Marker({
            position: { lat, lng },
            map: mapInstance,
            title: 'Start Location',
            draggable: true,
            label: { text: 'S', color: 'white' },
          });
          sMarker.addListener('dragend', () => {
            const pos = sMarker.getPosition();
            if (pos) {
              const updated = { lat: pos.lat(), lng: pos.lng() };
              setStartLocation(updated);
              startLocRef.current = updated;
            }
          });
          startMarkerRef.current = sMarker;
        } else if (!endLocRef.current) {
          const point = { lat, lng };
          setEndLocation(point);
          endLocRef.current = point;
          if (endMarkerRef.current) endMarkerRef.current.setMap(null);
          const eMarker = new google.maps.Marker({
            position: { lat, lng },
            map: mapInstance,
            title: 'End Location',
            draggable: true,
            label: { text: 'E', color: 'white' },
          });
          eMarker.addListener('dragend', () => {
            const pos = eMarker.getPosition();
            if (pos) {
              const updated = { lat: pos.lat(), lng: pos.lng() };
              setEndLocation(updated);
              endLocRef.current = updated;
            }
          });
          endMarkerRef.current = eMarker;
        } else {
          // Ignore further clicks; user can drag markers or use Reset to change
          return;
        }
      });

    } catch (err) {
      console.error('Error loading Google Maps:', err);
      setError('Failed to load Google Maps. Please check your API key.');
    }
  };

  const handleResetPoints = () => {
    setStartLocation(null);
    setEndLocation(null);
    startLocRef.current = null;
    endLocRef.current = null;
    if (startMarkerRef.current) {
      startMarkerRef.current.setMap(null);
      startMarkerRef.current = null;
    }
    if (endMarkerRef.current) {
      endMarkerRef.current.setMap(null);
      endMarkerRef.current = null;
    }
  };

  const handleSaveLocation = async () => {
    if (!vehicle) {
      setError('Vehicle is missing');
      return;
    }
    if (!startLocation || !endLocation) {
      setError('Please select both a start and an end location on the map');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save start point
      await vehicleService.addGpsLocation({
        vehicle_id: vehicle.id,
        latitude: startLocation.lat,
        longitude: startLocation.lng,
        timestamp: new Date().toISOString(),
      });
      // Save end point (slightly later timestamp to preserve order)
      await vehicleService.addGpsLocation({
        vehicle_id: vehicle.id,
        latitude: endLocation.lat,
        longitude: endLocation.lng,
        timestamp: new Date(Date.now() + 1000).toISOString(),
      });

      onClose();
      setStartLocation(null);
      setEndLocation(null);
      startLocRef.current = null;
      endLocRef.current = null;
      if (startMarkerRef.current) {
        startMarkerRef.current.setMap(null);
        startMarkerRef.current = null;
      }
      if (endMarkerRef.current) {
        endMarkerRef.current.setMap(null);
        endMarkerRef.current = null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save GPS locations');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStartLocation(null);
    setEndLocation(null);
    startLocRef.current = null;
    endLocRef.current = null;
    setError('');
    if (startMarkerRef.current) {
      startMarkerRef.current.setMap(null);
      startMarkerRef.current = null;
    }
    if (endMarkerRef.current) {
      endMarkerRef.current.setMap(null);
      endMarkerRef.current = null;
    }
    // Clean up the map so it will reinitialize correctly next time the modal opens
    if (map) {
      try {
        if (googleRef.current) {
          googleRef.current.maps.event.clearInstanceListeners(map);
        }
      } catch {}
      setMap(null);
    }
    // Remove any stored click listener reference
    if (clickListenerRef.current) {
      try { clickListenerRef.current.remove(); } catch {}
      clickListenerRef.current = null;
    }
    // Optional: clear the container
    if (mapRef.current) {
      mapRef.current.innerHTML = '';
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Add GPS Location - {vehicle?.title}
            </Dialog.Title>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={handleClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Click on the map to set the Start point (first click) and the End point (second click). You can drag markers to adjust.
              </p>
              {(startLocation || endLocation) && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-md space-y-1">
                  {startLocation && (
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 text-green-600 mr-2" />
                      <div className="text-sm">
                        <span className="font-medium text-blue-900">Start:</span>
                        <span className="text-blue-700 ml-2">
                          Lat: {startLocation.lat.toFixed(6)}, Lng: {startLocation.lng.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  )}
                  {endLocation && (
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 text-red-600 mr-2" />
                      <div className="text-sm">
                        <span className="font-medium text-blue-900">End:</span>
                        <span className="text-blue-700 ml-2">
                          Lat: {endLocation.lat.toFixed(6)}, Lng: {endLocation.lng.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div 
              ref={mapRef} 
              className="w-full h-96 rounded-lg border border-gray-300"
              style={{ minHeight: '400px' }}
            />

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetPoints}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset Points
              </button>
              <button
                type="button"
                onClick={handleSaveLocation}
                disabled={!startLocation || !endLocation || loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Start & End'}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
