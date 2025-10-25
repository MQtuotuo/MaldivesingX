import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { CheckCircle, Download, Phone, MapPin, Calendar, Users } from 'lucide-react';

export default function BookingConfirmationPage() {
  const { code } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [code]);

  const fetchBooking = async () => {
    try {
      const response = await axios.get(`/api/bookings/code/${code}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (booking?.qr_code) {
      const link = document.createElement('a');
      link.href = booking.qr_code;
      link.download = `booking-${booking.booking_code}.png`;
      link.click();
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

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600">Booking not found</p>
          <Link to="/trips" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            Browse trips
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">Your excursion has been successfully booked</p>
          </div>

          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-2">Booking Code</p>
              <p className="text-3xl font-bold text-primary-600">{booking.booking_code}</p>
            </div>
            
            {booking.qr_code && (
              <div className="flex justify-center mb-4">
                <img
                  src={booking.qr_code}
                  alt="Booking QR Code"
                  className="w-48 h-48 border-2 border-gray-200 rounded-lg"
                />
              </div>
            )}
            
            <div className="text-center">
              <button
                onClick={downloadQR}
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
              >
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </button>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Trip</p>
                  <p className="font-semibold">{booking.trip_title}</p>
                  <p className="text-sm text-gray-600">{booking.island}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{new Date(booking.booking_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Users className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Number of People</p>
                  <p className="font-semibold">{booking.num_people}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Your Contact</p>
                  <p className="font-semibold">{booking.tourist_whatsapp}</p>
                </div>
              </div>
            </div>
            
            {booking.notes && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Your Notes</p>
                <p className="text-gray-800">{booking.notes}</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Payment Information</h3>
            <p className="text-blue-800 mb-3">
              Total Amount: <span className="text-2xl font-bold">${booking.total_amount}</span>
            </p>
            <p className="text-blue-700 text-sm">
              Payment will be collected on-site by the provider. Please bring cash or arrange payment method with the provider.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-2">Provider Contact</h3>
            <p className="text-gray-800 font-medium">{booking.provider_name}</p>
            <p className="text-gray-600 flex items-center mt-1">
              <Phone className="h-4 w-4 mr-2" />
              {booking.provider_phone}
            </p>
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Save this booking code or QR code. You'll need to show it to the provider on the day of your excursion.
            </p>
            
            <div className="flex gap-3 justify-center">
              <Link
                to="/trips"
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Browse More Trips
              </Link>
              <button
                onClick={() => window.print()}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Print Confirmation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
