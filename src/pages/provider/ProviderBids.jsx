import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { TrendingUp, Check, X, MessageSquare } from 'lucide-react';

export default function ProviderBids() {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [response, setResponse] = useState({
    status: '',
    provider_response: '',
    counter_offer: '',
  });

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const res = await axios.get('/api/provider/bids');
      setBids(res.data);
    } catch (error) {
      if (error.response?.status === 403) {
        alert('Upgrade to Pro or VIP subscription to view bids');
      } else {
        console.error('Error fetching bids:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (bidId) => {
    try {
      await axios.put(`/api/provider/bids/${bidId}`, response);
      alert('Response sent successfully!');
      setRespondingTo(null);
      setResponse({ status: '', provider_response: '', counter_offer: '' });
      fetchBids();
    } catch (error) {
      alert('Error sending response: ' + (error.response?.data?.error || error.message));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      countered: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (user?.subscription_type === 'free') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <TrendingUp className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Upgrade to View Bids</h1>
            <p className="text-gray-600 mb-8">
              Pro and VIP providers can view and respond to tourist bids. Upgrade your subscription to access this feature.
            </p>
            <a
              href="/provider/subscription"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700"
            >
              View Subscription Plans
            </a>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Customer Bids</h1>
          <p className="text-gray-600 mt-2">Review and respond to price negotiations</p>
        </div>

        {bids.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No bids yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bids.map(bid => (
              <div key={bid.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{bid.trip_title}</h3>
                    <p className="text-sm text-gray-600">Original Price: ${bid.original_price} per person</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(bid.status)}`}>
                    {bid.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Tourist</p>
                    <p className="font-semibold">{bid.tourist_name}</p>
                    <p className="text-xs text-gray-600">{bid.tourist_whatsapp}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">{new Date(bid.proposed_date).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">People</p>
                    <p className="font-semibold">{bid.num_people}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Bid Amount</p>
                    <p className="text-2xl font-bold text-primary-600">${bid.bid_amount}</p>
                    <p className="text-xs text-gray-600">
                      Total: ${(bid.bid_amount * bid.num_people).toFixed(2)}
                    </p>
                  </div>
                </div>

                {bid.notes && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-1">Customer Notes</p>
                    <p className="text-gray-800">{bid.notes}</p>
                  </div>
                )}

                {bid.provider_response && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 mb-1">Your Response</p>
                    <p className="text-gray-800">{bid.provider_response}</p>
                    {bid.counter_offer && (
                      <p className="text-sm text-blue-800 mt-2">Counter Offer: ${bid.counter_offer} per person</p>
                    )}
                  </div>
                )}

                {bid.status === 'pending' && (
                  <>
                    {respondingTo === bid.id ? (
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => setResponse({ ...response, status: 'accepted' })}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold border-2 ${
                              response.status === 'accepted'
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-green-600 border-green-600 hover:bg-green-50'
                            }`}
                          >
                            <Check className="h-4 w-4 inline mr-2" />
                            Accept
                          </button>
                          <button
                            onClick={() => setResponse({ ...response, status: 'declined' })}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold border-2 ${
                              response.status === 'declined'
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-white text-red-600 border-red-600 hover:bg-red-50'
                            }`}
                          >
                            <X className="h-4 w-4 inline mr-2" />
                            Decline
                          </button>
                          <button
                            onClick={() => setResponse({ ...response, status: 'countered' })}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold border-2 ${
                              response.status === 'countered'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            <TrendingUp className="h-4 w-4 inline mr-2" />
                            Counter
                          </button>
                        </div>

                        {response.status === 'countered' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Counter Offer (per person)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={response.counter_offer}
                              onChange={(e) => setResponse({ ...response, counter_offer: e.target.value })}
                              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message to Tourist
                          </label>
                          <textarea
                            value={response.provider_response}
                            onChange={(e) => setResponse({ ...response, provider_response: e.target.value })}
                            rows="3"
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setRespondingTo(null);
                              setResponse({ status: '', provider_response: '', counter_offer: '' });
                            }}
                            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRespond(bid.id)}
                            disabled={!response.status}
                            className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
                          >
                            Send Response
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRespondingTo(bid.id)}
                        className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 flex items-center justify-center"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Respond to Bid
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
