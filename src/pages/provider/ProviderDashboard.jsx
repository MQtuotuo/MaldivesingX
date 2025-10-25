import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Package, Calendar, TrendingUp, MessageSquare, Star, DollarSign } from 'lucide-react';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    commissionRate: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tripsRes, bookingsRes, userRes] = await Promise.all([
        axios.get('/api/provider/trips'),
        axios.get('/api/provider/bookings'),
        axios.get('/api/auth/me'),
      ]);

      const trips = tripsRes.data;
      const bookings = bookingsRes.data;
      const userData = userRes.data;

      const commissionRate = userData.custom_commission_rate !== null
        ? userData.custom_commission_rate
        : (userData.subscription_type === 'vip' ? 0.06 : userData.subscription_type === 'pro' ? 0.08 : 0.15);

      const completedBookings = bookings.filter(b => b.status === 'completed');
      const totalRevenue = completedBookings.reduce((sum, b) => sum + b.total_amount, 0);

      setStats({
        totalTrips: trips.length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        completedBookings: completedBookings.length,
        totalRevenue: totalRevenue,
        commissionRate: commissionRate * 100,
      });

      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Here's an overview of your business</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Trips</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTrips}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-full">
                <Package className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <Link to="/provider/trips" className="text-sm text-primary-600 hover:text-primary-700 mt-4 inline-block">
              Manage trips →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBookings}</p>
                <p className="text-xs text-yellow-600 mt-1">{stats.pendingBookings} pending</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <Link to="/provider/bookings" className="text-sm text-primary-600 hover:text-primary-700 mt-4 inline-block">
              View bookings →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-600 mt-1">{stats.completedBookings} completed</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Commission Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.commissionRate}%</p>
                <p className="text-xs text-gray-600 mt-1">{user?.subscription_type || 'free'} plan</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <Link to="/provider/subscription" className="text-sm text-primary-600 hover:text-primary-700 mt-4 inline-block">
              Upgrade plan →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/provider/trips"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <Package className="h-8 w-8 text-primary-600 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Manage Trips</h3>
            <p className="text-gray-600 text-sm">Create, edit, and manage your excursions</p>
          </Link>

          <Link
            to="/provider/bids"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <MessageSquare className="h-8 w-8 text-primary-600 mb-3" />
            <h3 className="text-lg font-semibold mb-2">View Bids</h3>
            <p className="text-gray-600 text-sm">Respond to customer bid requests</p>
            {user?.subscription_type === 'free' && (
              <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Upgrade to Pro
              </span>
            )}
          </Link>

          <Link
            to="/provider/requests"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <Star className="h-8 w-8 text-primary-600 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Custom Requests</h3>
            <p className="text-gray-600 text-sm">View and respond to tourist requests</p>
            {user?.subscription_type === 'free' && (
              <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Upgrade to Pro
              </span>
            )}
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Bookings</h2>
            <Link to="/provider/bookings" className="text-sm text-primary-600 hover:text-primary-700">
              View all →
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No bookings yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trip</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tourist</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(booking => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{booking.trip_title}</td>
                      <td className="py-3 px-4 text-sm">{booking.tourist_name}</td>
                      <td className="py-3 px-4 text-sm">{new Date(booking.booking_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-sm font-semibold">${booking.total_amount}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
