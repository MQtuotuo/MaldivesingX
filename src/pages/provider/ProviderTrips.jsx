import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Plus, Edit, Eye, EyeOff } from 'lucide-react';

export default function ProviderTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    island: '',
    duration: '',
    price: '',
    max_group_size: '',
    activity_type: '',
    included_items: '',
    optional_addons: '',
    images: '',
    status: 'active',
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get('/api/provider/trips');
      setTrips(response.data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTrip) {
        await axios.put(`/api/trips/${editingTrip.id}`, formData);
        alert('Trip updated successfully!');
      } else {
        await axios.post('/api/trips', formData);
        alert('Trip created successfully!');
      }
      setShowForm(false);
      setEditingTrip(null);
      resetForm();
      fetchTrips();
    } catch (error) {
      alert('Error saving trip: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      island: '',
      duration: '',
      price: '',
      max_group_size: '',
      activity_type: '',
      included_items: '',
      optional_addons: '',
      images: '',
      status: 'active',
    });
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setFormData({
      title: trip.title,
      description: trip.description || '',
      island: trip.island,
      duration: trip.duration || '',
      price: trip.price,
      max_group_size: trip.max_group_size || '',
      activity_type: trip.activity_type || '',
      included_items: trip.included_items || '',
      optional_addons: trip.optional_addons || '',
      images: trip.images || '',
      status: trip.status,
    });
    setShowForm(true);
  };

  const toggleStatus = async (trip) => {
    try {
      const newStatus = trip.status === 'active' ? 'inactive' : 'active';
      await axios.put(`/api/trips/${trip.id}`, { ...trip, status: newStatus });
      fetchTrips();
    } catch (error) {
      alert('Error updating trip status');
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingTrip(null);
              resetForm();
            }}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            {showForm ? 'Cancel' : 'Create New Trip'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">{editingTrip ? 'Edit Trip' : 'Create New Trip'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trip Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Island *</label>
                  <input
                    type="text"
                    required
                    value={formData.island}
                    onChange={(e) => setFormData({ ...formData, island: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 3 hours"
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
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
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (per person) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Group Size</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_group_size}
                    onChange={(e) => setFormData({ ...formData, max_group_size: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Included Items (comma-separated)
                </label>
                <textarea
                  value={formData.included_items}
                  onChange={(e) => setFormData({ ...formData, included_items: e.target.value })}
                  rows="2"
                  placeholder="e.g., Snorkeling gear, Lunch, Guide, Photos"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTrip(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700"
                >
                  {editingTrip ? 'Update Trip' : 'Create Trip'}
                </button>
              </div>
            </form>
          </div>
        )}

        {trips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No trips yet. Create your first trip to get started!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => (
              <div key={trip.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={trip.images || 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8'}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full font-semibold text-primary-600">
                    ${trip.price}
                  </div>
                  {trip.status === 'inactive' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                        Inactive
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{trip.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{trip.description}</p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(trip)}
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 flex items-center justify-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => toggleStatus(trip)}
                      className={`flex-1 ${
                        trip.status === 'active' ? 'bg-gray-200 text-gray-800' : 'bg-green-600 text-white'
                      } px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 flex items-center justify-center`}
                    >
                      {trip.status === 'active' ? (
                        <><EyeOff className="h-4 w-4 mr-1" /> Hide</>
                      ) : (
                        <><Eye className="h-4 w-4 mr-1" /> Show</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
