<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GpsLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'latitude',
        'longitude',
        'timestamp',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'timestamp' => 'datetime',
    ];

    /**
     * Get the vehicle that owns the GPS location.
     */
    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
