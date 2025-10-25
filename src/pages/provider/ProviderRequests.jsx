import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { MessageSquare, Send, TrendingUp } from 'lucide-react';

export default function ProviderRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [proposal, setProposal] = useState({
    proposal_description: '',
    proposed_price: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/provider/requests');
      setRequests(response.data);
    } catch (error) {
      if (error.response?.status === 403) {
        alert('Upgrade to Pro or VIP subscription to view custom requests');
      } else {
        console.error('Error fetching requests:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async (requestId) => {
    try {
      await axios.post(`/api/provider/requests/${requestId}/respond`, proposal);
      alert('Proposal submitted successfully! The tourist will be notified.');
      setRespondingTo(null);
      setProposal({ proposal_description: '', proposed_price: '' });
      fetchRequests();
    } catch (error) {
      alert('Error submitting proposal: ' + (error.response?.data?.error || error.message));
    }
  };

  if (user?.subscription_type === 'free') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <MessageSquare className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Upgrade to View Custom Requests</h1>
            <p className="text-gray-600 mb-8">
              Pro and VIP providers can view and respond to custom requests from tourists. Upgrade your subscription to access this feature.
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
          <h1 className="text-3xl font-bold text-gray-900">Custom Requests</h1>
          <p className="text-gray-600 mt-2">Respond to tourist requests and win new business</p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No open requests for your island yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(request => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Custom Request</h3>
                    <p className="text-sm text-gray-600">Posted {new Date(request.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                    {request.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Tourist</p>
                    <p className="font-semibold">{request.tourist_name}</p>
                    <p className="text-xs text-gray-600">{request.tourist_whatsapp}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Island</p>
                    <p className="font-semibold">{request.island}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">People</p>
                    <p className="font-semibold">{request.num_people}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">
                      {request.preferred_date
                        ? new Date(request.preferred_date).toLocaleDateString()
                        : 'Flexible'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-semibold">{request.budget_range || 'Not specified'}</p>
                  </div>
                </div>

                {request.activity_type && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Activity Type</p>
                    <p className="font-semibold">{request.activity_type}</p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Request Details</p>
                  <p className="text-gray-800">{request.description}</p>
                </div>

                {respondingTo === request.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Proposal Description *
                      </label>
                      <textarea
                        required
                        value={proposal.proposal_description}
                        onChange={(e) => setProposal({ ...proposal, proposal_description: e.target.value })}
                        rows="4"
                        placeholder="Describe your proposed excursion, what's included, duration, meeting point, etc."
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proposed Price (per person) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={proposal.proposed_price}
                        onChange={(e) => setProposal({ ...proposal, proposed_price: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {proposal.proposed_price && (
                        <p className="text-sm text-gray-600 mt-2">
                          Total for {request.num_people} people: ${(proposal.proposed_price * request.num_people).toFixed(2)}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setRespondingTo(null);
                          setProposal({ proposal_description: '', proposed_price: '' });
                        }}
                        className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmitProposal(request.id)}
                        disabled={!proposal.proposal_description || !proposal.proposed_price}
                        className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Submit Proposal
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setRespondingTo(request.id)}
                    className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 flex items-center justify-center"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Submit a Proposal
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
