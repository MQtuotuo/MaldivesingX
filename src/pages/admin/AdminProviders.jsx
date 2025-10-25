import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Edit, Save, X } from 'lucide-react';

export default function AdminProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    subscription_type: '',
    custom_commission_rate: '',
    subscription_paid_until: '',
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await axios.get('/api/admin/providers');
      setProviders(response.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (provider) => {
    setEditingId(provider.id);
    setEditForm({
      subscription_type: provider.subscription_type || 'free',
      custom_commission_rate: provider.custom_commission_rate !== null ? provider.custom_commission_rate * 100 : '',
      subscription_paid_until: provider.subscription_paid_until ? provider.subscription_paid_until.split('T')[0] : '',
    });
  };

  const handleSave = async (providerId) => {
    try {
      const payload = {
        subscription_type: editForm.subscription_type,
        custom_commission_rate: editForm.custom_commission_rate ? parseFloat(editForm.custom_commission_rate) / 100 : null,
        subscription_paid_until: editForm.subscription_paid_until || null,
      };

      await axios.put(`/api/admin/providers/${providerId}/subscription`, payload);
      alert('Provider subscription updated successfully!');
      setEditingId(null);
      fetchProviders();
    } catch (error) {
      alert('Error updating provider: ' + (error.response?.data?.error || error.message));
    }
  };

  const getCommissionRate = (provider) => {
    if (provider.custom_commission_rate !== null) {
      return (provider.custom_commission_rate * 100).toFixed(0) + '%';
    }
    const rates = { free: '15%', pro: '8%', vip: '6%' };
    return rates[provider.subscription_type] || '15%';
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Providers</h1>
          <p className="text-gray-600 mt-2">Update subscription types and commission rates</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Provider</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Island</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Subscription</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Commission</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Paid Until</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {providers.map(provider => (
                  <tr key={provider.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-gray-900">{provider.name}</p>
                        <p className="text-sm text-gray-600">{provider.email}</p>
                        <p className="text-xs text-gray-500">{provider.phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">{provider.island}</span>
                    </td>
                    <td className="py-4 px-6">
                      {editingId === provider.id ? (
                        <select
                          value={editForm.subscription_type}
                          onChange={(e) => setEditForm({ ...editForm, subscription_type: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="vip">VIP</option>
                        </select>
                      ) : (
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          provider.subscription_type === 'vip' ? 'bg-purple-100 text-purple-800' :
                          provider.subscription_type === 'pro' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {provider.subscription_type || 'free'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {editingId === provider.id ? (
                        <div>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={editForm.custom_commission_rate}
                            onChange={(e) => setEditForm({ ...editForm, custom_commission_rate: e.target.value })}
                            placeholder="Auto"
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                          />
                          <span className="ml-1 text-sm">%</span>
                          <p className="text-xs text-gray-500 mt-1">Leave empty for default</p>
                        </div>
                      ) : (
                        <div>
                          <span className="font-semibold text-gray-900">{getCommissionRate(provider)}</span>
                          {provider.custom_commission_rate !== null && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Custom
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {editingId === provider.id ? (
                        <input
                          type="date"
                          value={editForm.subscription_paid_until}
                          onChange={(e) => setEditForm({ ...editForm, subscription_paid_until: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      ) : (
                        <span className="text-sm text-gray-900">
                          {provider.subscription_paid_until
                            ? new Date(provider.subscription_paid_until).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {editingId === provider.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(provider.id)}
                            className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
                            title="Save"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(provider)}
                          className="bg-primary-600 text-white p-2 rounded hover:bg-primary-700"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {providers.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No providers yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
