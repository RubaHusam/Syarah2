<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\GpsLocation;
use Illuminate\Support\Facades\Hash;

class VehicleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test user
        $user = User::firstOrCreate(
            ['email' => 'admin@syarah.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password123'),
            ]
        );

        // Sample vehicle data
        $vehicles = [
            [
                'title' => 'Toyota Camry 2023',
                'plate_number' => 'ABC-123',
                'brand' => 'Toyota',
                'model' => 'Camry',
                'price' => 85000.00,
                'year' => 2023,
                'status' => 'Published',
            ],
            [
                'title' => 'BMW X5 2022',
                'plate_number' => 'XYZ-456',
                'brand' => 'BMW',
                'model' => 'X5',
                'price' => 120000.00,
                'year' => 2022,
                'status' => 'Published',
            ],
            [
                'title' => 'Mercedes C-Class 2024',
                'plate_number' => 'MER-789',
                'brand' => 'Mercedes',
                'model' => 'C-Class',
                'price' => 95000.00,
                'year' => 2024,
                'status' => 'Published',
            ],
            [
                'title' => 'Audi A4 2023',
                'plate_number' => 'AUD-101',
                'brand' => 'Audi',
                'model' => 'A4',
                'price' => 78000.00,
                'year' => 2023,
                'status' => 'Not Published',
            ],
            [
                'title' => 'Honda Accord 2022',
                'plate_number' => 'HON-202',
                'brand' => 'Honda',
                'model' => 'Accord',
                'price' => 65000.00,
                'year' => 2022,
                'status' => 'Published',
            ],
            [
                'title' => 'Lexus ES 2024',
                'plate_number' => 'LEX-303',
                'brand' => 'Lexus',
                'model' => 'ES',
                'price' => 110000.00,
                'year' => 2024,
                'status' => 'Published',
            ],
            [
                'title' => 'Nissan Altima 2023',
                'plate_number' => 'NIS-404',
                'brand' => 'Nissan',
                'model' => 'Altima',
                'price' => 58000.00,
                'year' => 2023,
                'status' => 'Not Published',
            ],
            [
                'title' => 'Hyundai Sonata 2022',
                'plate_number' => 'HYU-505',
                'brand' => 'Hyundai',
                'model' => 'Sonata',
                'price' => 52000.00,
                'year' => 2022,
                'status' => 'Published',
            ],
        ];

        // Create vehicles and GPS locations
        foreach ($vehicles as $vehicleData) {
            $vehicle = Vehicle::create([
                'user_id' => $user->id,
                'title' => $vehicleData['title'],
                'plate_number' => $vehicleData['plate_number'],
                'brand' => $vehicleData['brand'],
                'model' => $vehicleData['model'],
                'price' => $vehicleData['price'],
                'year' => $vehicleData['year'],
                'status' => $vehicleData['status'],
            ]);

            // Create random GPS locations for each vehicle (simulating travel history)
            $baseLatitude = 24.7136; // Riyadh latitude
            $baseLongitude = 46.6753; // Riyadh longitude

            for ($i = 0; $i < rand(5, 15); $i++) {
                // Generate random coordinates around Riyadh
                $latitude = $baseLatitude + (rand(-100, 100) / 1000); // ±0.1 degree variation
                $longitude = $baseLongitude + (rand(-100, 100) / 1000); // ±0.1 degree variation
                
                GpsLocation::create([
                    'vehicle_id' => $vehicle->id,
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'timestamp' => now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59)),
                ]);
            }
        }

        $this->command->info('Created ' . count($vehicles) . ' vehicles with GPS locations for user: ' . $user->email);
    }
}
