import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Calendar, Users, Phone, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/provider/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.put(`/api/provider/bookings/${bookingId}`, { status });
      alert('Booking status updated successfully!');
      fetchBookings();
    } catch (error) {
      alert('Error updating booking status');
    }
  };

  const markAsCompleted = async (bookingId) => {
    if (confirm('Mark this booking as completed? This will record the commission.')) {
      await updateBookingStatus(bookingId, 'completed');
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">Manage all your customer bookings</p>
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

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No {filter !== 'all' ? filter : ''} bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{booking.trip_title}</h3>
                    <p className="text-sm text-gray-600">{booking.island}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold">{new Date(booking.booking_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Users className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">People</p>
                      <p className="font-semibold">{booking.num_people}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Tourist</p>
                      <p className="font-semibold">{booking.tourist_name}</p>
                      <p className="text-xs text-gray-600">{booking.tourist_whatsapp}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-primary-600">${booking.total_amount}</p>
                    {booking.commission_amount && (
                      <p className="text-xs text-gray-600">
                        Commission: ${booking.commission_amount.toFixed(2)} ({(booking.commission_rate * 100).toFixed(0)}%)
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Booking Code</p>
                  <p className="font-mono text-lg font-bold text-gray-900">{booking.booking_code}</p>
                </div>

                {booking.notes && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-1">Customer Notes</p>
                    <p className="text-gray-800">{booking.notes}</p>
                  </div>
                )}

                {booking.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 flex items-center justify-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <button
                    onClick={() => markAsCompleted(booking.id)}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </button>
                )}

                {booking.status === 'completed' && booking.completed_at && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <CheckCircle className="h-4 w-4 inline mr-2" />
                      Completed on {new Date(booking.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
