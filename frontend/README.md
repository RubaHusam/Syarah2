# Syarah Fleet Management - Frontend

Modern Next.js frontend for the Syarah Fleet Management System with TailwindCSS, authentication, and Google Maps integration.

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18
- **npm** or **yarn** - Package manager
- **Google Maps API Key** - For location services

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update your `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Frontend will be available at: `http://localhost:3000`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📱 Features

- **Authentication** - Login/Register with auto-login
- **Dashboard** - Statistics with interactive charts
- **Vehicle Management** - Full CRUD operations
- **GPS Tracking** - Google Maps integration
- **Travel Analytics** - Distance calculations
- **Responsive Design** - Works on all devices
- **Image Upload** - Vehicle photo management

## 🎯 Pages

- `/` - Login page
- `/register` - Registration page
- `/dashboard` - Admin dashboard with stats
- `/vehicles` - Vehicle management table
- `/travels` - Travel history and analytics

## 🔗 Backend Connection

Make sure the Laravel backend is running at `http://localhost:8000` before starting the frontend.
