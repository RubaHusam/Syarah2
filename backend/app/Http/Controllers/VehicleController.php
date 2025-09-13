<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class VehicleController extends Controller
{
    /**
     * Create a new VehicleController instance.
     */
    public function __construct()
    {
        // Middleware is now handled in routes
    }

    /**
     * Display a listing of the resource with pagination and filters.
     */
    public function index(Request $request)
    {
        $user = JWTAuth::user();
        $query = Vehicle::with(['user', 'gpsLocations']);

        // If user is not admin, filter by user_id
        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        // Include trashed vehicles if requested
        if ($request->has('include_deleted') && $request->include_deleted === 'true') {
            $query = $query->withTrashed();
        }

        // Apply filters
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->has('brand') && $request->brand !== '') {
            $query->where('brand', 'like', '%' . $request->brand . '%');
        }

        if ($request->has('model') && $request->model !== '') {
            $query->where('model', 'like', '%' . $request->model . '%');
        }

        if ($request->has('year') && $request->year !== '') {
            $query->where('year', $request->year);
        }

        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhere('plate_number', 'like', '%' . $search . '%')
                  ->orWhere('brand', 'like', '%' . $search . '%')
                  ->orWhere('model', 'like', '%' . $search . '%');
            });
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $vehicles = $query->paginate($perPage);

        // Add total distance to each vehicle
        $vehicles->getCollection()->transform(function ($vehicle) {
            $vehicle->total_distance = $vehicle->total_distance;
            return $vehicle;
        });

        return response()->json([
            'success' => true,
            'data' => $vehicles
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'plate_number' => 'required|string|unique:vehicles,plate_number',
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'status' => 'required|in:Published,Not Published',
            'image' => 'nullable|string|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $vehicleData = $validator->validated();
        $vehicleData['user_id'] = JWTAuth::user()->id;

        // Handle image URL - no file processing needed, just store the URL
        if ($request->has('image') && $request->input('image')) {
            $vehicleData['image'] = $request->input('image');
        }

        $vehicle = Vehicle::create($vehicleData);
        $vehicle->load(['user', 'gpsLocations']);

        return response()->json([
            'success' => true,
            'message' => 'Vehicle created successfully',
            'data' => $vehicle
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Vehicle $vehicle)
    {
        $user = JWTAuth::user();
        
        // Check if user owns the vehicle or is admin
        if (!$user->isAdmin() && $vehicle->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $vehicle->load(['user', 'gpsLocations']);
        $vehicle->total_distance = $vehicle->total_distance;

        return response()->json([
            'success' => true,
            'data' => $vehicle
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Vehicle $vehicle)
    {
        // Check if user owns the vehicle or is admin
        $user = JWTAuth::user();
        if (!$user->isAdmin() && $vehicle->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'plate_number' => 'sometimes|required|string|unique:vehicles,plate_number,' . $vehicle->id,
            'brand' => 'sometimes|required|string|max:255',
            'model' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'year' => 'sometimes|required|integer|min:1900|max:' . (date('Y') + 1),
            'status' => 'sometimes|required|in:Published,Not Published',
            'image' => 'nullable|string|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $vehicleData = $validator->validated();

        // Handle image URL - no file processing needed, just store the URL
        if ($request->has('image') && $request->input('image')) {
            $vehicleData['image'] = $request->input('image');
        }

        $vehicle->update($vehicleData);
        $vehicle->load(['user', 'gpsLocations']);

        return response()->json([
            'success' => true,
            'message' => 'Vehicle updated successfully',
            'data' => $vehicle
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Vehicle $vehicle)
    {
        // Check if user owns the vehicle or is admin
        $user = JWTAuth::user();
        if (!$user->isAdmin() && $vehicle->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Soft delete the vehicle (keeps image for potential restoration)
        $vehicle->delete();

        return response()->json([
            'success' => true,
            'message' => 'Vehicle deleted successfully'
        ]);
    }

    /**
     * Restore a soft deleted vehicle.
     */
    public function restore($id)
    {
        $vehicle = Vehicle::withTrashed()->find($id);
        
        if (!$vehicle) {
            return response()->json([
                'success' => false,
                'message' => 'Vehicle not found'
            ], 404);
        }

        // Check if user owns the vehicle or is admin
        $user = JWTAuth::user();
        if (!$user->isAdmin() && $vehicle->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $vehicle->restore();

        return response()->json([
            'success' => true,
            'message' => 'Vehicle restored successfully',
            'data' => $vehicle
        ]);
    }

    /**
     * Get vehicle statistics.
     */
    public function statistics()
    {
        $user = JWTAuth::user();
        
        // If admin, get all vehicles, otherwise get user's vehicles
        $query = Vehicle::query();
        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }
        
        $totalVehicles = $query->count();
        $publishedVehicles = (clone $query)->where('status', 'Published')->count();
        $unpublishedVehicles = (clone $query)->where('status', 'Not Published')->count();

        $vehiclesByStatus = [
            'Published' => $publishedVehicles,
            'Not Published' => $unpublishedVehicles
        ];

        $vehiclesByBrand = (clone $query)
            ->selectRaw('brand, COUNT(*) as count')
            ->groupBy('brand')
            ->get()
            ->pluck('count', 'brand');

        return response()->json([
            'success' => true,
            'data' => [
                'total_vehicles' => $totalVehicles,
                'vehicles_by_status' => $vehiclesByStatus,
                'vehicles_by_brand' => $vehiclesByBrand
            ]
        ]);
    }
}
