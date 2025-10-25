import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Search } from 'lucide-react';

export default function ViewBookingPage() {
  const navigate = useNavigate();
  const [bookingCode, setBookingCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (bookingCode.trim()) {
      navigate(`/booking-confirmation/${bookingCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <Search className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">View Your Booking</h1>
            <p className="text-gray-600">Enter your booking code to view details and QR code</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Code
              </label>
              <input
                type="text"
                required
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value)}
                placeholder="Enter your 10-character booking code"
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-center text-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary-500"
                maxLength="10"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              View Booking
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Can't find your booking code? Check your confirmation email or WhatsApp messages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
