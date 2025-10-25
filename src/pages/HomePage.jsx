import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Search, Calendar, Shield, DollarSign, Waves, Palmtree } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover Paradise in the <span className="text-primary-600">Maldives</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Book unforgettable excursions, snorkeling adventures, and island tours. Submit custom requests or bid on your perfect trip.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/trips"
                className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
              >
                Browse Excursions
              </Link>
              <Link
                to="/submit-request"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg border-2 border-primary-600"
              >
                Custom Request
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Book With Us</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Verified Providers</h3>
            <p className="text-gray-600">All tour providers are verified and experienced in providing excellent service.</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Best Prices</h3>
            <p className="text-gray-600">Submit bids and get competitive offers. Pay on-site with no hidden fees.</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Easy Booking</h3>
            <p className="text-gray-600">Book instantly or submit custom requests. Get QR codes for quick check-in.</p>
          </div>
        </div>
      </div>

      {/* Popular Activities */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Popular Activities</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Link to="/trips?activity_type=Water Activities" className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <Waves className="h-12 w-12 text-primary-600 mb-3" />
              <h3 className="text-lg font-semibold">Water Activities</h3>
              <p className="text-gray-600 text-sm mt-2">Snorkeling, diving, surfing</p>
            </Link>
            
            <Link to="/trips?activity_type=Cultural" className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <Palmtree className="h-12 w-12 text-primary-600 mb-3" />
              <h3 className="text-lg font-semibold">Cultural Tours</h3>
              <p className="text-gray-600 text-sm mt-2">Island visits, local experiences</p>
            </Link>
            
            <Link to="/trips?activity_type=Adventure" className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <Search className="h-12 w-12 text-primary-600 mb-3" />
              <h3 className="text-lg font-semibold">Adventures</h3>
              <p className="text-gray-600 text-sm mt-2">Fishing, sailing, kayaking</p>
            </Link>
            
            <Link to="/trips" className="bg-primary-600 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <Calendar className="h-12 w-12 text-white mb-3" />
              <h3 className="text-lg font-semibold">All Activities</h3>
              <p className="text-white text-sm mt-2">Browse all excursions</p>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA for Providers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-primary-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Are you a tour provider?</h2>
          <p className="text-xl mb-8 opacity-90">Join our platform and reach thousands of tourists visiting the Maldives</p>
          <Link
            to="/register"
            className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Become a Provider
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Maldives Excursions Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
