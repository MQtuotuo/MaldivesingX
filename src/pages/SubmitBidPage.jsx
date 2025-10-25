import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ArrowLeft, DollarSign } from 'lucide-react';

export default function SubmitBidPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    tourist_name: '',
    tourist_whatsapp: '',
    proposed_date: '',
    num_people: 1,
    bid_amount: '',
    notes: '',
  });

  useEffect(() => {
    fetchTrip();
  }, [tripId]);

  const fetchTrip = async () => {
    try {
      const response = await axios.get(`/api/trips/${tripId}`);
      setTrip(response.data);
      setFormData(prev => ({ ...prev, bid_amount: response.data.price * 0.8 })); // Suggest 20% off
    } catch (error) {
      console.error('Error fetching trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await axios.post('/api/bids', {
        trip_id: tripId,
        ...formData,
      });
      
      alert('Bid submitted successfully! The provider will review and respond soon.');
      navigate(`/trips/${tripId}`);
    } catch (error) {
      alert('Error submitting bid: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
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
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600">Trip not found</p>
        </div>
      </div>
    );
  }

  const totalBid = formData.bid_amount * formData.num_people;
  const originalTotal = trip.price * formData.num_people;
  const savings = originalTotal - totalBid;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          to={`/trips/${tripId}`}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to trip
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit a Bid</h1>
          <p className="text-gray-600 mb-6">Propose your price for: <strong>{trip.title}</strong></p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Original Price:</strong> ${trip.price} per person
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Submit your bid below. The provider will review and may accept, decline, or make a counter-offer.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.tourist_name}
                  onChange={(e) => setFormData({ ...formData, tourist_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.tourist_whatsapp}
                  onChange={(e) => setFormData({ ...formData, tourist_whatsapp: e.target.value })}
                  placeholder="+960-XXX-XXXX"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
                <input
                  type="date"
                  required
                  value={formData.proposed_date}
                  onChange={(e) => setFormData({ ...formData, proposed_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of People *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={trip.max_group_size || 100}
                  value={formData.num_people}
                  onChange={(e) => setFormData({ ...formData, num_people: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Bid Price (per person) * 
                <span className="text-gray-500 ml-2">(Original: ${trip.price})</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={formData.bid_amount}
                  onChange={(e) => setFormData({ ...formData, bid_amount: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="4"
                placeholder="Any special requests or reasons for your bid..."
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Your total bid:</span>
                <span className="text-2xl font-bold text-primary-600">${totalBid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Original total:</span>
                <span className="text-gray-600 line-through">${originalTotal.toFixed(2)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-green-600">Potential savings:</span>
                  <span className="text-green-600 font-semibold">${savings.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(`/trips/${tripId}`)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Bid'}
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              By submitting a bid, you agree to be contacted by the provider via WhatsApp regarding your offer.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
