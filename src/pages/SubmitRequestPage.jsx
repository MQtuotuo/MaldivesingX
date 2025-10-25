import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { CheckCircle } from 'lucide-react';

export default function SubmitRequestPage() {
  const navigate = useNavigate();
  const [islands, setIslands] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    tourist_name: '',
    tourist_whatsapp: '',
    island: '',
    preferred_date: '',
    num_people: 1,
    activity_type: '',
    budget_range: '',
    description: '',
  });

  useEffect(() => {
    fetchIslands();
  }, []);

  const fetchIslands = async () => {
    try {
      const response = await axios.get('/api/islands');
      setIslands(response.data);
    } catch (error) {
      console.error('Error fetching islands:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await axios.post('/api/requests', formData);
      setSubmitted(true);
    } catch (error) {
      alert('Error submitting request: ' + (error.response?.data?.error || error.message));
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Your custom request has been submitted successfully. Providers will review your request and send proposals to your WhatsApp.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/trips')}
                className="block w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Browse Excursions
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    tourist_name: '',
                    tourist_whatsapp: '',
                    island: '',
                    preferred_date: '',
                    num_people: 1,
                    activity_type: '',
                    budget_range: '',
                    description: '',
                  });
                }}
                className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit a Custom Request</h1>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Tell us what you want, and local providers will send you proposals!
          </p>
          
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Island *</label>
                <select
                  required
                  value={formData.island}
                  onChange={(e) => setFormData({ ...formData, island: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select an island</option>
                  {islands.map(island => (
                    <option key={island} value={island}>{island}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date (optional)</label>
                <input
                  type="date"
                  value={formData.preferred_date}
                  onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of People *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.num_people}
                  onChange={(e) => setFormData({ ...formData, num_people: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type (optional)</label>
                <select
                  value={formData.activity_type}
                  onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select type</option>
                  <option value="Water Activities">Water Activities</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Relaxation">Relaxation</option>
                  <option value="Photography">Photography</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range (optional)</label>
              <select
                value={formData.budget_range}
                onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select budget</option>
                <option value="$0-$50">$0 - $50 per person</option>
                <option value="$50-$100">$50 - $100 per person</option>
                <option value="$100-$200">$100 - $200 per person</option>
                <option value="$200-$500">$200 - $500 per person</option>
                <option value="$500+">$500+ per person</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe what you're looking for *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="5"
                placeholder="Tell us about your ideal excursion. Include details like specific activities, duration, group size, special requirements, etc."
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>What happens next?</strong>
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Pro and VIP providers in your selected island will receive your request and can send you customized proposals via WhatsApp with pricing and details.
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/trips')}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
