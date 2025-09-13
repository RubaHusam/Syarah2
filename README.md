# Syarah Fleet Management System

A comprehensive fleet management REST application built with Laravel backend and Next.js frontend, featuring JWT authentication, vehicle management, GPS tracking, and travel analytics.

## 🚀 Features

### Backend (Laravel)
- **JWT Authentication** with tymon/jwt-auth
- **RESTful API** with comprehensive endpoints
- **Database Management** with migrations for users, vehicles, and GPS locations
- **Eloquent Models** with proper relationships
- **Vehicle CRUD** operations with pagination and filters
- **GPS Location Tracking** with Haversine distance calculations
- **Travel Analytics** with distance computation between GPS points
- **Image Upload** support for vehicle photos
- **API Documentation** with consistent response formats

### Frontend (Next.js)
- **Modern UI** with TailwindCSS and responsive design
- **Authentication System** with auto-login after registration
- **Protected Routes** with middleware-based access control
- **Admin Dashboard** with statistics and interactive charts
- **Vehicle Management** with full CRUD operations
- **Advanced Filtering** and server-side pagination
- **Google Maps Integration** for GPS location tracking
- **Travel History** with detailed segment analysis
- **Image Upload** with preview functionality
- **Real-time Updates** and error handling

## 🛠 Tech Stack

### Backend
- **Laravel 12** - PHP framework
- **MySQL** - Database (Syarah)
- **JWT Authentication** - tymon/jwt-auth
- **Eloquent ORM** - Database relationships
- **Laravel Sanctum** - API authentication
- **Image Storage** - Laravel filesystem

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS framework
- **Headless UI** - Accessible UI components
- **Heroicons** - Beautiful icons
- **Recharts** - Data visualization
- **Google Maps API** - Location services
- **Axios** - HTTP client
- **js-cookie** - Cookie management

## 📋 Prerequisites

- **PHP** >= 8.1
- **Composer** - PHP dependency manager
- **Node.js** >= 18
- **npm** or **yarn** - Package manager
- **MySQL** - Database server
- **Google Maps API Key** - For location services

## 🚀 Installation

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` file with your database credentials:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=syarah
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

4. **Generate Application Key**
   ```bash
   php artisan key:generate
   ```

5. **Generate JWT Secret**
   ```bash
   php artisan jwt:secret
   ```

6. **Create Database**
   ```sql
   CREATE DATABASE syarah;
   ```

7. **Run Migrations**
   ```bash
   php artisan migrate
   ```

8. **Create Storage Link**
   ```bash
   php artisan storage:link
   ```

9. **Start Development Server**
   ```bash
   php artisan serve
   ```
   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Frontend will be available at `http://localhost:3000`

## 🗄 Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `created_at` / `updated_at` - Timestamps

### Vehicles Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `title` - Vehicle title
- `image` - Vehicle image path (nullable)
- `plate_number` - Unique plate number
- `brand` - Vehicle brand
- `model` - Vehicle model
- `price` - Vehicle price (decimal)
- `year` - Manufacturing year
- `status` - Published/Not Published
- `created_at` / `updated_at` - Timestamps

### GPS_Locations Table
- `id` - Primary key
- `vehicle_id` - Foreign key to vehicles
- `latitude` - GPS latitude (decimal 10,8)
- `longitude` - GPS longitude (decimal 11,8)
- `timestamp` - Location timestamp
- `created_at` / `updated_at` - Timestamps

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with auto-login
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/profile` - Get user profile

### Vehicles
- `GET /api/vehicles` - List vehicles with pagination and filters
- `POST /api/vehicles` - Create new vehicle
- `GET /api/vehicles/{id}` - Get vehicle details
- `PUT /api/vehicles/{id}` - Update vehicle
- `DELETE /api/vehicles/{id}` - Delete vehicle
- `GET /api/vehicles-statistics` - Get vehicle statistics

### GPS Locations
- `POST /api/gps-locations` - Add GPS location
- `GET /api/vehicles/{id}/locations` - Get vehicle locations
- `GET /api/vehicles/{id}/travel-segments` - Get travel segments with distances
- `GET /api/travels` - Get all travels with calculated distances

## 🎯 Key Features Explained

### JWT Authentication
- Secure token-based authentication
- Auto-login after registration
- Token refresh mechanism
- Protected route middleware

### Vehicle Management
- Full CRUD operations
- Image upload with storage
- Advanced filtering and search
- Server-side pagination
- Status management (Published/Not Published)

### GPS Tracking
- Google Maps integration
- Click-to-add location functionality
- Haversine formula for distance calculation
- Travel segment analysis
- Real-time location updates

### Dashboard Analytics
- Vehicle statistics with charts
- Status distribution (Pie chart)
- Brand distribution (Bar chart)
- Interactive data visualization

### Distance Calculation
The system uses the Haversine formula to calculate distances between GPS coordinates:

```php
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
```

## 🔒 Security Features

- **JWT Token Authentication** - Secure API access
- **Password Hashing** - Bcrypt encryption
- **Input Validation** - Server-side validation
- **CORS Protection** - Cross-origin request security
- **Route Protection** - Middleware-based access control
- **File Upload Security** - Image validation and storage

## 📱 Responsive Design

The frontend is fully responsive and works seamlessly across:
- **Desktop** - Full-featured interface
- **Tablet** - Optimized layout
- **Mobile** - Touch-friendly navigation

## 🚀 Deployment

### Backend Deployment
1. Configure production environment variables
2. Set up MySQL database
3. Run migrations in production
4. Configure web server (Apache/Nginx)
5. Set up SSL certificate
6. Configure file storage permissions

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to hosting platform (Vercel, Netlify, etc.)
3. Configure environment variables
4. Set up custom domain (optional)

## 🧪 Testing

### Backend Testing
```bash
php artisan test
```

### Frontend Testing
```bash
npm run test
```

## 📊 Performance Optimization

- **Database Indexing** - Optimized queries
- **Image Optimization** - Compressed uploads
- **Lazy Loading** - Efficient data loading
- **Caching** - API response caching
- **Pagination** - Large dataset handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔄 Version History

- **v1.0.0** - Initial release with full fleet management features
- JWT authentication system
- Vehicle CRUD operations
- GPS tracking and analytics
- Modern responsive UI

---

**Built with ❤️ using Laravel and Next.js**



Screenshots:


<img width="1679" height="851" alt="image" src="https://github.com/user-attachments/assets/1b2ccd8a-e1ef-45e0-aa25-0bd7b2a8a553" />
<img width="1680" height="855" alt="image" src="https://github.com/user-attachments/assets/2abf57a2-6109-42f4-b6bb-02e90bfe303f" />
<img width="1680" height="853" alt="image" src="https://github.com/user-attachments/assets/24d4743d-d314-425b-8d43-8bc606a9c754" />
<img width="1679" height="853" alt="image" src="https://github.com/user-attachments/assets/a1bfaa12-4a78-4080-a658-e0f9e7201772" />
<img width="1680" height="858" alt="image" src="https://github.com/user-attachments/assets/98444e33-7d87-4248-b4f3-a60491246460" />
<img width="1680" height="854" alt="image" src="https://github.com/user-attachments/assets/41e80542-d8a4-4a4a-95c1-8e3d6d0fada2" />
<img width="1680" height="857" alt="image" src="https://github.com/user-attachments/assets/1bbb2f12-65cf-4fb6-97f5-9329d87a2d67" />
<img width="1680" height="858" alt="image" src="https://github.com/user-attachments/assets/69c86e35-e8c0-443e-8a1d-90a9b804e4b4" />
<img width="1680" height="858" alt="image" src="https://github.com/user-attachments/assets/62a59eed-9039-4429-aab9-b90e14a383ae" />









