'use client';

import { useState, useEffect } from 'react';
import { supabase, Booking, Service, Package } from '@/lib/supabase';
import {
  Calendar,
  Users,
  DollarSign,
  Package as PackageIcon,
  Settings,
  LogOut,
  Check,
  X,
  Eye,
} from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'packages'>('bookings');
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    const [bookingsRes, servicesRes, packagesRes] = await Promise.all([
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('services').select('*').order('created_at', { ascending: true }),
      supabase.from('packages').select('*').order('created_at', { ascending: true }),
    ]);

    if (bookingsRes.data) setBookings(bookingsRes.data);
    if (servicesRes.data) setServices(servicesRes.data);
    if (packagesRes.data) setPackages(packagesRes.data);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production, use proper authentication
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: Booking['status']) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (!error) {
      fetchAllData();
      alert('Booking status updated successfully');
    } else {
      alert('Failed to update booking status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'checked_in':
        return 'bg-green-100 text-green-800';
      case 'checked_out':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    totalRevenue: bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.total_price, 0),
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
        <div className="bg-white rounded-sm shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-semibold text-primary mb-2">
              Admin Portal
            </h1>
            <p className="text-gray-600">Sthem's and Sabe's Transport Service</p>
            <div className="divider-accent mx-auto mt-4"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter admin password"
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Access Dashboard
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-6 text-center">
            Default password: admin123 (Change this in production!)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="section-container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-semibold text-primary">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600">Sthem's and Sabe's Transport Service</p>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center text-gray-600 hover:text-accent-orange transition-colors"
            >
              <LogOut size={20} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="section-container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-sm shadow-md">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Bookings</p>
              <Calendar className="text-accent-orange" size={24} />
            </div>
            <p className="text-3xl font-bold text-primary">{stats.totalBookings}</p>
          </div>

          <div className="bg-white p-6 rounded-sm shadow-md">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Pending</p>
              <Users className="text-yellow-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-primary">{stats.pendingBookings}</p>
          </div>

          <div className="bg-white p-6 rounded-sm shadow-md">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Confirmed</p>
              <Check className="text-green-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-primary">{stats.confirmedBookings}</p>
          </div>

          <div className="bg-white p-6 rounded-sm shadow-md">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <DollarSign className="text-accent-teal" size={24} />
            </div>
            <p className="text-3xl font-bold text-primary">
              R{stats.totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-sm shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'bookings'
                    ? 'border-b-2 border-accent-orange text-accent-orange'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'services'
                    ? 'border-b-2 border-accent-orange text-accent-orange'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                Services
              </button>
              <button
                onClick={() => setActiveTab('packages')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'packages'
                    ? 'border-b-2 border-accent-orange text-accent-orange'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                Packages
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-semibold text-primary">
                    All Bookings
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Customer
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Dates
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Guests
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Total
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <p className="font-medium text-primary">{booking.customer_name}</p>
                            <p className="text-xs text-gray-600">{booking.customer_email}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm capitalize">{booking.booking_type}</span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(booking.check_in_date).toLocaleDateString()} -
                            <br />
                            {new Date(booking.check_out_date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm">{booking.number_of_guests}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-accent-orange">
                              R{booking.total_price.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedBooking(booking)}
                                className="text-accent-teal hover:text-accent-teal/80"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>
                              {booking.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() =>
                                      updateBookingStatus(booking.id, 'confirmed')
                                    }
                                    className="text-green-600 hover:text-green-700"
                                    title="Confirm"
                                  >
                                    <Check size={18} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      updateBookingStatus(booking.id, 'cancelled')
                                    }
                                    className="text-red-600 hover:text-red-700"
                                    title="Cancel"
                                  >
                                    <X size={18} />
                                  </button>
                                </>
                              )}
                              {booking.status === 'confirmed' && (
                                <button
                                  onClick={() =>
                                    updateBookingStatus(booking.id, 'checked_in')
                                  }
                                  className="text-blue-600 hover:text-blue-700 text-xs"
                                  title="Check In"
                                >
                                  Check In
                                </button>
                              )}
                              {booking.status === 'checked_in' && (
                                <button
                                  onClick={() =>
                                    updateBookingStatus(booking.id, 'checked_out')
                                  }
                                  className="text-gray-600 hover:text-gray-700 text-xs"
                                  title="Check Out"
                                >
                                  Check Out
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-semibold text-primary">
                    All Services
                  </h2>
                  <button className="btn-primary text-sm">Add New Service</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-sm p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-primary">{service.name}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            service.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {service.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-accent-orange">
                          R{service.price.toLocaleString()}
                        </p>
                        <span className="text-xs uppercase tracking-wide text-gray-500">
                          {service.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Packages Tab */}
            {activeTab === 'packages' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-semibold text-primary">
                    All Packages
                  </h2>
                  <button className="btn-primary text-sm">Create New Package</button>
                </div>

                <div className="space-y-6">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="border border-gray-200 rounded-sm p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-serif font-semibold text-primary mb-1">
                            {pkg.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {pkg.duration_days} Day Experience
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-accent-orange">
                            R{pkg.price.toLocaleString()}
                          </p>
                          <span
                            className={`inline-block mt-2 px-3 py-1 rounded-full text-xs ${
                              pkg.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {pkg.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{pkg.description}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-sm text-primary mb-2">
                            Inclusions:
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {pkg.inclusions.map((inc, i) => (
                              <li key={i}>• {inc}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-sm max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-semibold text-primary">
                Booking Details
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Customer Name</p>
                <p className="font-medium text-primary">{selectedBooking.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-primary">{selectedBooking.customer_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-primary">{selectedBooking.customer_phone}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Check-in</p>
                  <p className="font-medium text-primary">
                    {new Date(selectedBooking.check_in_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check-out</p>
                  <p className="font-medium text-primary">
                    {new Date(selectedBooking.check_out_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Number of Guests</p>
                <p className="font-medium text-primary">{selectedBooking.number_of_guests}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Booking Type</p>
                <p className="font-medium text-primary capitalize">
                  {selectedBooking.booking_type}
                </p>
              </div>
              {selectedBooking.special_requests && (
                <div>
                  <p className="text-sm text-gray-600">Special Requests</p>
                  <p className="font-medium text-primary">
                    {selectedBooking.special_requests}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Total Price</p>
                <p className="text-2xl font-bold text-accent-orange">
                  R{selectedBooking.total_price.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    selectedBooking.status
                  )}`}
                >
                  {selectedBooking.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Booking ID: {selectedBooking.id}
                <br />
                Created: {new Date(selectedBooking.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
