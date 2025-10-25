import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Calendar, Download } from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/admin/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
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

  const exportToCSV = () => {
    const csvData = [
      ['Booking Code', 'Trip', 'Provider', 'Tourist', 'Date', 'People', 'Amount', 'Commission', 'Status'],
      ...filteredBookings.map(b => [
        b.booking_code,
        b.trip_title,
        b.provider_name,
        b.tourist_name,
        new Date(b.booking_date).toLocaleDateString(),
        b.num_people,
        b.total_amount,
        b.commission_amount?.toFixed(2) || '0.00',
        b.status
      ])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
            <p className="text-gray-600 mt-2">View and manage platform bookings</p>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Filter tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-1 flex gap-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-1 py-2 px-4 rounded-md font-medium capitalize transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status}
              {status === 'all' && ` (${bookings.length})`}
              {status !== 'all' && ` (${bookings.filter(b => b.status === status).length})`}
            </button>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              ${bookings.reduce((sum, b) => sum + (b.status === 'completed' ? b.total_amount : 0), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Commission</p>
            <p className="text-2xl font-bold text-primary-600">
              ${bookings.reduce((sum, b) => sum + (b.status === 'completed' && b.commission_amount ? b.commission_amount : 0), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Avg Booking Value</p>
            <p className="text-2xl font-bold text-gray-900">
              ${bookings.length > 0 ? (bookings.reduce((sum, b) => sum + b.total_amount, 0) / bookings.length).toFixed(2) : '0.00'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {bookings.length > 0 ? ((bookings.filter(b => b.status === 'completed').length / bookings.length) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No {filter !== 'all' ? filter : ''} bookings found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Booking Code</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Trip</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Provider</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Tourist</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Commission</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm font-semibold">{booking.booking_code}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-gray-900">{booking.trip_title}</p>
                          <p className="text-xs text-gray-600">{booking.num_people} people</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-900">{booking.provider_name}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm text-gray-900">{booking.tourist_name}</p>
                          <p className="text-xs text-gray-600">{booking.tourist_whatsapp}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-900">
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-900">${booking.total_amount.toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-semibold text-primary-600">
                            ${booking.commission_amount?.toFixed(2) || '0.00'}
                          </span>
                          {booking.commission_rate && (
                            <p className="text-xs text-gray-600">
                              {(booking.commission_rate * 100).toFixed(0)}%
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
