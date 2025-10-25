import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Users, Package, Calendar, DollarSign, TrendingUp, MessageSquare } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Platform overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Providers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.activeProviders || 0}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-full">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <Link to="/admin/providers" className="text-sm text-primary-600 hover:text-primary-700 mt-4 inline-block">
              Manage providers →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Trips</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.activeTrips || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalBookings || 0}</p>
                <p className="text-xs text-green-600 mt-1">{stats?.completedBookings || 0} completed</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <Link to="/admin/bookings" className="text-sm text-primary-600 hover:text-primary-700 mt-4 inline-block">
              View bookings →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">${stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-primary-600 mt-1">Commission: ${stats?.totalCommission?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Activity Overview</h3>
              <MessageSquare className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Bids</span>
                <span className="font-semibold text-lg">{stats?.pendingBids || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Open Requests</span>
                <span className="font-semibold text-lg">{stats?.openRequests || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <TrendingUp className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-2">
              <Link
                to="/admin/providers"
                className="block w-full bg-primary-600 text-white py-2 px-4 rounded-lg text-center font-medium hover:bg-primary-700"
              >
                Manage Providers
              </Link>
              <Link
                to="/admin/subscriptions"
                className="block w-full bg-green-600 text-white py-2 px-4 rounded-lg text-center font-medium hover:bg-green-700"
              >
                Review Subscription Payments
              </Link>
              <Link
                to="/admin/bookings"
                className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-center font-medium hover:bg-blue-700"
              >
                View All Bookings
              </Link>
            </div>
          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Platform Health</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats?.completedBookings > 0
                  ? ((stats.completedBookings / stats.totalBookings) * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                ${stats?.totalRevenue && stats?.totalBookings
                  ? (stats.totalRevenue / stats.totalBookings).toFixed(2)
                  : '0.00'}
              </div>
              <p className="text-sm text-gray-600">Avg Booking Value</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats?.totalCommission && stats?.totalRevenue
                  ? ((stats.totalCommission / stats.totalRevenue) * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="text-sm text-gray-600">Avg Commission Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
