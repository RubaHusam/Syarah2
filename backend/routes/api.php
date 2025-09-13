<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\GpsLocationController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Authentication routes
Route::group(['prefix' => 'auth'], function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::get('profile', [AuthController::class, 'userProfile']);
});

// Protected routes
Route::group(['middleware' => 'auth:api'], function () {
    // Vehicle routes
    Route::apiResource('vehicles', VehicleController::class);
    Route::post('vehicles/{id}/restore', [VehicleController::class, 'restore']);
    Route::get('vehicles-statistics', [VehicleController::class, 'statistics']);
    
    // User routes
    Route::apiResource('users', UserController::class);
    
    // GPS Location routes
    Route::post('gps-locations', [GpsLocationController::class, 'store']);
    Route::get('vehicles/{vehicle}/locations', [GpsLocationController::class, 'getVehicleLocations']);
    Route::get('vehicles/{vehicle}/travel-segments', [GpsLocationController::class, 'getTravelSegments']);
    Route::get('travels', [GpsLocationController::class, 'getAllTravels']);
});
