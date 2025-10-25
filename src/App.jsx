import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Public pages
import HomePage from './pages/HomePage';
import TripListPage from './pages/TripListPage';
import TripDetailPage from './pages/TripDetailPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import SubmitBidPage from './pages/SubmitBidPage';
import SubmitRequestPage from './pages/SubmitRequestPage';
import ViewBookingPage from './pages/ViewBookingPage';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Provider pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderTrips from './pages/provider/ProviderTrips';
import ProviderBookings from './pages/provider/ProviderBookings';
import ProviderBids from './pages/provider/ProviderBids';
import ProviderRequests from './pages/provider/ProviderRequests';
import ProviderSubscription from './pages/provider/ProviderSubscription';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProviders from './pages/admin/AdminProviders';
import AdminBookings from './pages/admin/AdminBookings';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/trips" element={<TripListPage />} />
          <Route path="/trips/:id" element={<TripDetailPage />} />
          <Route path="/booking-confirmation/:code" element={<BookingConfirmationPage />} />
          <Route path="/submit-bid/:tripId" element={<SubmitBidPage />} />
          <Route path="/submit-request" element={<SubmitRequestPage />} />
          <Route path="/view-booking" element={<ViewBookingPage />} />

          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Provider routes */}
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/provider/trips" element={<ProviderTrips />} />
          <Route path="/provider/bookings" element={<ProviderBookings />} />
          <Route path="/provider/bids" element={<ProviderBids />} />
          <Route path="/provider/requests" element={<ProviderRequests />} />
          <Route path="/provider/subscription" element={<ProviderSubscription />} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/providers" element={<AdminProviders />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
