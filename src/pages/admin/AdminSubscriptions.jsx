import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Check, X, Clock } from 'lucide-react';

export default function AdminSubscriptions() {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingTransactions();
  }, []);

  const fetchPendingTransactions = async () => {
    try {
      const response = await axios.get('/api/admin/subscription/pending');
      setPendingTransactions(response.data);
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transactionId) => {
    const validUntil = prompt('Enter subscription valid until date (YYYY-MM-DD):');
    if (!validUntil) return;

    try {
      await axios.put(`/api/admin/subscription/${transactionId}/approve`, {
        status: 'approved',
        subscription_paid_until: validUntil,
      });
      alert('Subscription approved successfully!');
      fetchPendingTransactions();
    } catch (error) {
      alert('Error approving subscription: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleReject = async (transactionId) => {
    if (!confirm('Are you sure you want to reject this payment?')) return;

    try {
      await axios.put(`/api/admin/subscription/${transactionId}/approve`, {
        status: 'rejected',
      });
      alert('Payment rejected');
      fetchPendingTransactions();
    } catch (error) {
      alert('Error rejecting payment: ' + (error.response?.data?.error || error.message));
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Payments</h1>
          <p className="text-gray-600 mt-2">Review and approve offline subscription payments</p>
        </div>

        {pendingTransactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No pending subscription payments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTransactions.map(transaction => (
              <div key={transaction.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{transaction.provider_name}</h3>
                    <p className="text-sm text-gray-600">{transaction.provider_email}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                    Pending Review
                  </span>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Subscription Plan</p>
                    <p className="font-semibold text-lg capitalize">{transaction.subscription_type}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-semibold text-lg text-primary-600">${transaction.amount}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-semibold capitalize">
                      {transaction.payment_method.replace('_', ' ')}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Submitted Date</p>
                    <p className="font-semibold">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-2">Payment Reference / Transaction ID</p>
                  <p className="font-mono text-gray-900 font-semibold">{transaction.payment_reference}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(transaction.id)}
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Approve Payment
                  </button>
                  <button
                    onClick={() => handleReject(transaction.id)}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Reject Payment
                  </button>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> When approving, you'll be asked to set the subscription valid until date. 
                    For monthly subscriptions, typically set it to one month from today.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
