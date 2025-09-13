<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'image',
        'plate_number',
        'brand',
        'model',
        'price',
        'year',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'year' => 'integer',
    ];

    /**
     * Get the user that owns the vehicle.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the GPS locations for the vehicle.
     */
    public function gpsLocations()
    {
        return $this->hasMany(GpsLocation::class);
    }

    /**
     * Calculate total traveled distance for this vehicle.
     */
    public function getTotalDistanceAttribute()
    {
        $locations = $this->gpsLocations()->orderBy('timestamp')->get();
        
        if ($locations->count() < 2) {
            return 0;
        }

        $totalDistance = 0;
        for ($i = 1; $i < $locations->count(); $i++) {
            $totalDistance += $this->haversineDistance(
                $locations[$i - 1]->latitude,
                $locations[$i - 1]->longitude,
                $locations[$i]->latitude,
                $locations[$i]->longitude
            );
        }

        return round($totalDistance, 2);
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
