# Syarah Fleet Management - Backend API

Laravel REST API backend for the Syarah Fleet Management System with JWT authentication, vehicle management, and GPS tracking.

## 🚀 Quick Start

### Prerequisites
- **PHP** >= 8.1
- **Composer** - PHP dependency manager
- **MySQL** - Database server

### Installation Steps

1. **Install Dependencies**
   ```bash
   composer install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update your `.env` file with database credentials:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=syarah
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

3. **Generate Keys**
   ```bash
   php artisan key:generate
   php artisan jwt:secret
   ```

4. **Setup Database**
   ```sql
   CREATE DATABASE syarah;
   ```
   
   ```bash
   php artisan migrate
   ```

5. **Create Storage Link**
   ```bash
   php artisan storage:link
   ```

6. **Seed Database (Optional)**
   ```bash
   php artisan db:seed
   ```
   
   This creates sample data:
   - Test user: `admin@syarah.com` / `password123`
   - 8 sample vehicles with GPS locations

7. **Start Server**
   ```bash
   php artisan serve
   ```
   
   API will be available at: `http://localhost:8000`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Vehicles
- `GET /api/vehicles` - List vehicles (with pagination)
- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles/{id}` - Get vehicle details
- `PUT /api/vehicles/{id}` - Update vehicle
- `DELETE /api/vehicles/{id}` - Delete vehicle

### GPS & Travel
- `POST /api/gps-locations` - Add GPS location
- `GET /api/vehicles/{id}/locations` - Get vehicle locations
- `GET /api/travels` - Get travel data with distances

## 🔧 Features
- JWT Authentication with tymon/jwt-auth
- Vehicle CRUD operations with image upload
- GPS location tracking
- Haversine distance calculations
- Travel analytics
- RESTful API design
