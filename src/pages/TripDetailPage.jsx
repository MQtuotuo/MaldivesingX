import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { MapPin, Clock, Users, DollarSign, CheckCircle, Tag, Phone, ArrowLeft } from 'lucide-react';

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  const [formData, setFormData] = useState({
    tourist_name: '',
    tourist_whatsapp: '',
    booking_date: '',
    num_people: 1,
    notes: '',
  });

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const response = await axios.get(`/api/trips/${id}`);
      setTrip(response.data);
    } catch (error) {
      console.error('Error fetching trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/bookings', {
        trip_id: id,
        ...formData,
      });
      
      navigate(`/booking-confirmation/${response.data.booking_code}`);
    } catch (error) {
      alert('Error creating booking: ' + (error.response?.data?.error || error.message));
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

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-xl text-gray-600">Trip not found</p>
        </div>
      </div>
    );
  }

  const totalPrice = trip.price * formData.num_people;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/trips')}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to all trips
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-96">
            <img
              src={trip.images || 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8'}
              alt={trip.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{trip.title}</h1>
                
                <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                    {trip.island}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary-600" />
                    {trip.duration}
                  </div>
                  {trip.max_group_size && (
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-primary-600" />
                      Max {trip.max_group_size} people
                    </div>
                  )}
                  {trip.activity_type && (
                    <div className="flex items-center">
                      <Tag className="h-5 w-5 mr-2 text-primary-600" />
                      {trip.activity_type}
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{trip.description}</p>
                </div>
                
                {trip.included_items && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">What's Included</h2>
                    <ul className="space-y-2">
                      {trip.included_items.split(',').map((item, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold mb-3">Provider Information</h2>
                  <p className="text-gray-700 mb-2"><strong>{trip.provider_name}</strong></p>
                  {trip.provider_description && (
                    <p className="text-gray-600 mb-2">{trip.provider_description}</p>
                  )}
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {trip.provider_phone}
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-primary-600 mb-2">
                      ${trip.price}
                    </div>
                    <p className="text-gray-600">per person</p>
                  </div>
                  
                  {!showBookingForm ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowBookingForm(true)}
                        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                      >
                        Book Now
                      </button>
                      <Link
                        to={`/submit-bid/${id}`}
                        className="block w-full bg-white border-2 border-primary-600 text-primary-600 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors text-center"
                      >
                        Submit a Bid
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.tourist_name}
                          onChange={(e) => setFormData({ ...formData, tourist_name: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
                        <input
                          type="tel"
                          required
                          value={formData.tourist_whatsapp}
                          onChange={(e) => setFormData({ ...formData, tourist_whatsapp: e.target.value })}
                          placeholder="+960-XXX-XXXX"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.booking_date}
                          onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of People *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max={trip.max_group_size || 100}
                          value={formData.num_people}
                          onChange={(e) => setFormData({ ...formData, num_people: parseInt(e.target.value) })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          rows="3"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-semibold mb-4">
                          <span>Total:</span>
                          <span className="text-primary-600">${totalPrice}</span>
                        </div>
                        
                        <button
                          type="submit"
                          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                        >
                          Confirm Booking
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setShowBookingForm(false)}
                          className="w-full mt-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-500 text-center">
                        Payment on-site. You'll receive a booking code after confirmation.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
