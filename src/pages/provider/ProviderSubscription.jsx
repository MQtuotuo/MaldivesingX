import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Check, Star, Crown, DollarSign } from 'lucide-react';

export default function ProviderSubscription() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [showOfflineForm, setShowOfflineForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [offlinePayment, setOfflinePayment] = useState({
    payment_method: '',
    payment_reference: '',
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/provider/subscription/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleOfflinePayment = async (e) => {
    e.preventDefault();
    try {
      const amount = selectedPlan === 'pro' ? 29 : 99;
      await axios.post('/api/provider/subscription/offline-payment', {
        subscription_type: selectedPlan,
        amount,
        ...offlinePayment,
      });
      alert('Payment submitted for admin approval!');
      setShowOfflineForm(false);
      setSelectedPlan('');
      setOfflinePayment({ payment_method: '', payment_reference: '' });
      fetchTransactions();
    } catch (error) {
      alert('Error submitting payment: ' + (error.response?.data?.error || error.message));
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      commission: '15%',
      icon: DollarSign,
      features: [
        'List unlimited trips',
        'Receive bookings',
        'Basic dashboard',
        'Cannot view bids',
        'Cannot view custom requests',
      ],
      notIncluded: [3, 4],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      commission: '8%',
      icon: Star,
      features: [
        'Everything in Free',
        'View and respond to bids',
        'View custom requests',
        'Lower commission rate',
        'Priority support',
      ],
      recommended: true,
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 99,
      commission: '6%',
      icon: Crown,
      features: [
        'Everything in Pro',
        'Lowest commission rate',
        'Priority listing exposure',
        'Featured provider badge',
        'Dedicated account manager',
      ],
    },
  ];

  const currentPlan = user?.subscription_type || 'free';
  const customCommission = user?.custom_commission_rate;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600 mt-2">
            Current Plan: <strong className="capitalize">{currentPlan}</strong>
            {customCommission !== null && (
              <span className="ml-2 text-primary-600">
                (Custom commission: {(customCommission * 100).toFixed(0)}%)
              </span>
            )}
          </p>
          {user?.subscription_paid_until && (
            <p className="text-sm text-gray-600 mt-1">
              Valid until: {new Date(user.subscription_paid_until).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map(plan => {
            const Icon = plan.icon;
            const isCurrent = plan.id === currentPlan;
            
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  plan.recommended ? 'ring-2 ring-primary-600' : ''
                }`}
              >
                {plan.recommended && (
                  <div className="bg-primary-600 text-white text-center py-2 text-sm font-semibold">
                    Recommended
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-10 w-10 text-primary-600" />
                    {isCurrent && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                        Current Plan
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-sm text-gray-600">Commission: </span>
                    <span className="text-xl font-bold text-primary-600">{plan.commission}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check
                          className={`h-5 w-5 mr-2 mt-0.5 flex-shrink-0 ${
                            plan.notIncluded?.includes(index) ? 'text-gray-300' : 'text-green-600'
                          }`}
                        />
                        <span className={plan.notIncluded?.includes(index) ? 'text-gray-400 line-through' : 'text-gray-700'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  {!isCurrent && plan.id !== 'free' && (
                    <button
                      onClick={() => {
                        setSelectedPlan(plan.id);
                        setShowOfflineForm(true);
                      }}
                      className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                    >
                      Upgrade to {plan.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Offline Payment Form */}
        {showOfflineForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Submit Offline Payment</h2>
            <p className="text-gray-600 mb-6">
              Please complete your payment via bank transfer or cash, then submit the details below for admin approval.
            </p>
            
            <form onSubmit={handleOfflinePayment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Plan</label>
                <input
                  type="text"
                  value={selectedPlan.toUpperCase()}
                  disabled
                  className="w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                <select
                  required
                  value={offlinePayment.payment_method}
                  onChange={(e) => setOfflinePayment({ ...offlinePayment, payment_method: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select payment method</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Reference / Transaction ID *
                </label>
                <input
                  type="text"
                  required
                  value={offlinePayment.payment_reference}
                  onChange={(e) => setOfflinePayment({ ...offlinePayment, payment_reference: e.target.value })}
                  placeholder="Enter transaction ID or reference number"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowOfflineForm(false);
                    setSelectedPlan('');
                    setOfflinePayment({ payment_method: '', payment_reference: '' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Payment History */}
        {transactions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Payment History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Method</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reference</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-sm capitalize">{tx.subscription_type}</td>
                      <td className="py-3 px-4 text-sm font-semibold">${tx.amount}</td>
                      <td className="py-3 px-4 text-sm">{tx.payment_method.replace('_', ' ')}</td>
                      <td className="py-3 px-4 text-sm font-mono text-xs">{tx.payment_reference}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          tx.status === 'approved' ? 'bg-green-100 text-green-800' :
                          tx.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
