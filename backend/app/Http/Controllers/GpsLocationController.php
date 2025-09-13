<?php

namespace App\Http\Controllers;

use App\Models\GpsLocation;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class GpsLocationController extends Controller
{
    /**
     * Create a new GpsLocationController instance.
     */
    public function __construct()
    {
        // Middleware is now handled in routes
    }

    /**
     * Store a new GPS location for a vehicle.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vehicle_id' => 'required|exists:vehicles,id',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'timestamp' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user owns the vehicle
        $user = JWTAuth::user();
        $vehicle = Vehicle::find($request->vehicle_id);
        if (!$user->isAdmin() && $vehicle->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $locationData = $validator->validated();
        $locationData['timestamp'] = $locationData['timestamp'] ?? now();

        $gpsLocation = GpsLocation::create($locationData);
        $gpsLocation->load('vehicle');

        return response()->json([
            'success' => true,
            'message' => 'GPS location saved successfully',
            'data' => $gpsLocation
        ], 201);
    }

    /**
     * Get GPS locations for a specific vehicle.
     */
    public function getVehicleLocations(Vehicle $vehicle)
    {
        // Check if user owns the vehicle or is admin
        $user = JWTAuth::user();
        if (!$user->isAdmin() && $vehicle->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $locations = $vehicle->gpsLocations()
            ->orderBy('timestamp', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $locations
        ]);
    }

    /**
     * Get travel segments with calculated distances.
     */
    public function getTravelSegments(Vehicle $vehicle)
    {
        // Check if user owns the vehicle or is admin
        $user = JWTAuth::user();
        if (!$user->isAdmin() && $vehicle->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $locations = $vehicle->gpsLocations()
            ->orderBy('timestamp', 'asc')
            ->get();

        if ($locations->count() < 2) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'Not enough GPS locations to calculate travel segments'
            ]);
        }

        $segments = [];
        for ($i = 1; $i < $locations->count(); $i++) {
            $startLocation = $locations[$i - 1];
            $endLocation = $locations[$i];

            $distance = $this->haversineDistance(
                $startLocation->latitude,
                $startLocation->longitude,
                $endLocation->latitude,
                $endLocation->longitude
            );

            $segments[] = [
                'start_location' => [
                    'id' => $startLocation->id,
                    'latitude' => $startLocation->latitude,
                    'longitude' => $startLocation->longitude,
                    'timestamp' => $startLocation->timestamp
                ],
                'end_location' => [
                    'id' => $endLocation->id,
                    'latitude' => $endLocation->latitude,
                    'longitude' => $endLocation->longitude,
                    'timestamp' => $endLocation->timestamp
                ],
                'distance_km' => round($distance, 2),
                'duration_minutes' => $startLocation->timestamp->diffInMinutes($endLocation->timestamp)
            ];
        }

        $totalDistance = array_sum(array_column($segments, 'distance_km'));

        return response()->json([
            'success' => true,
            'data' => [
                'vehicle' => $vehicle->only(['id', 'title', 'plate_number']),
                'segments' => $segments,
                'total_distance_km' => round($totalDistance, 2),
                'total_segments' => count($segments)
            ]
        ]);
    }

    /**
     * Get all travels with distances for the authenticated user.
     */
    public function getAllTravels()
    {
        $user = JWTAuth::user();
        
        // If admin, get all vehicles, otherwise get user's vehicles
        $query = Vehicle::with('gpsLocations');
        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }
        
        $vehicles = $query->get();

        $allTravels = [];

        foreach ($vehicles as $vehicle) {
            $locations = $vehicle->gpsLocations->sortBy('timestamp');

            if ($locations->count() >= 2) {
                $segments = [];
                $totalDistance = 0;

                for ($i = 1; $i < $locations->count(); $i++) {
                    $startLocation = $locations->values()[$i - 1];
                    $endLocation = $locations->values()[$i];

                    $distance = $this->haversineDistance(
                        $startLocation->latitude,
                        $startLocation->longitude,
                        $endLocation->latitude,
                        $endLocation->longitude
                    );

                    $totalDistance += $distance;

                    $segments[] = [
                        'start_location' => [
                            'latitude' => $startLocation->latitude,
                            'longitude' => $startLocation->longitude,
                            'timestamp' => $startLocation->timestamp
                        ],
                        'end_location' => [
                            'latitude' => $endLocation->latitude,
                            'longitude' => $endLocation->longitude,
                            'timestamp' => $endLocation->timestamp
                        ],
                        'distance_km' => round($distance, 2)
                    ];
                }

                $allTravels[] = [
                    'vehicle' => $vehicle->only(['id', 'title', 'plate_number', 'brand', 'model']),
                    'total_distance_km' => round($totalDistance, 2),
                    'segments_count' => count($segments),
                    'segments' => $segments
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $allTravels
        ]);
    }

    /**
     * Calculate distance between two points using Haversine formula.
     */
    private function haversineDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
