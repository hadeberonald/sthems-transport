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
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'packages'>('bookings');
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Modal states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  // Form states
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'attraction' as 'attraction' | 'transport' | 'lodging',
    is_active: true,
  });

  const [packageForm, setPackageForm] = useState({
    name: '',
    description: '',
    duration_days: 1,
    price: '',
    inclusions: [''],
    is_active: true,
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    try {
      const [bookingsRes, servicesRes, packagesRes] = await Promise.all([
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('services').select('*').order('created_at', { ascending: true }),
        supabase.from('packages').select('*').order('created_at', { ascending: true }),
      ]);

      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (packagesRes.data) setPackages(packagesRes.data);

      console.log('Fetched data:', {
        bookings: bookingsRes.data?.length,
        services: servicesRes.data?.length,
        packages: packagesRes.data?.length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: Booking['status']) => {
    const confirmed = window.confirm(`Are you sure you want to mark this booking as ${newStatus}?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) throw error;

      fetchAllData();
      alert(`Booking status updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status');
    }
  };

  const deleteBooking = async (bookingId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this booking? This cannot be undone.');
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('bookings').delete().eq('id', bookingId);

      if (error) throw error;

      fetchAllData();
      alert('Booking deleted successfully!');
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    }
  };

  // Service CRUD
  const openServiceModal = (service: Service | null = null) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        name: service.name,
        description: service.description,
        price: service.price.toString(),
        category: service.category,
        is_active: service.is_active,
      });
    } else {
      setEditingService(null);
      setServiceForm({
        name: '',
        description: '',
        price: '',
        category: 'attraction',
        is_active: true,
      });
    }
    setShowServiceModal(true);
  };

  const saveService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const serviceData = {
        name: serviceForm.name,
        description: serviceForm.description,
        price: parseFloat(serviceForm.price),
        category: serviceForm.category,
        is_active: serviceForm.is_active,
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;
        alert('Service updated successfully!');
      } else {
        const { error } = await supabase.from('services').insert([serviceData]);

        if (error) throw error;
        alert('Service added successfully!');
      }

      setShowServiceModal(false);
      fetchAllData();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service');
    }
  };

  const deleteService = async (serviceId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this service?');
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('services').delete().eq('id', serviceId);

      if (error) throw error;

      fetchAllData();
      alert('Service deleted successfully!');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  // Package CRUD
  const openPackageModal = (pkg: Package | null = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setPackageForm({
        name: pkg.name,
        description: pkg.description,
        duration_days: pkg.duration_days,
        price: pkg.price.toString(),
        inclusions: pkg.inclusions,
        is_active: pkg.is_active,
      });
    } else {
      setEditingPackage(null);
      setPackageForm({
        name: '',
        description: '',
        duration_days: 1,
        price: '',
        inclusions: [''],
        is_active: true,
      });
    }
    setShowPackageModal(true);
  };

  const savePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const packageData = {
        name: packageForm.name,
        description: packageForm.description,
        duration_days: packageForm.duration_days,
        price: parseFloat(packageForm.price),
        inclusions: packageForm.inclusions.filter(inc => inc.trim() !== ''),
        service_ids: [],
        is_active: packageForm.is_active,
      };

      if (editingPackage) {
        const { error } = await supabase
          .from('packages')
          .update(packageData)
          .eq('id', editingPackage.id);

        if (error) throw error;
        alert('Package updated successfully!');
      } else {
        const { error } = await supabase.from('packages').insert([packageData]);

        if (error) throw error;
        alert('Package added successfully!');
      }

      setShowPackageModal(false);
      fetchAllData();
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Failed to save package');
    }
  };

  const deletePackage = async (packageId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this package?');
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('packages').delete().eq('id', packageId);

      if (error) throw error;

      fetchAllData();
      alert('Package deleted successfully!');
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package');
    }
  };

  const addInclusion = () => {
    setPackageForm(prev => ({
      ...prev,
      inclusions: [...prev.inclusions, ''],
    }));
  };

  const updateInclusion = (index: number, value: string) => {
    setPackageForm(prev => ({
      ...prev,
      inclusions: prev.inclusions.map((inc, i) => (i === index ? value : inc)),
    }));
  };

  const removeInclusion = (index: number) => {
    setPackageForm(prev => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index),
    }));
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

        {/* Tabs - keeping your existing UI exactly */}
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

                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No bookings yet</p>
                  </div>
                ) : (
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
                                <button
                                  onClick={() => deleteBooking(booking.id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-semibold text-primary">
                    All Services
                  </h2>
                  <button onClick={() => openServiceModal()} className="btn-primary text-sm flex items-center">
                    <Plus size={18} className="mr-2" />
                    Add New Service
                  </button>
                </div>

                {services.length === 0 ? (
                  <div className="text-center py-12">
                    <PackageIcon size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No services yet</p>
                    <button onClick={() => openServiceModal()} className="btn-primary text-sm">
                      Add Your First Service
                    </button>
                  </div>
                ) : (
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
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-lg font-bold text-accent-orange">
                            R{service.price.toLocaleString()}
                          </p>
                          <span className="text-xs uppercase tracking-wide text-gray-500">
                            {service.category}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openServiceModal(service)}
                            className="flex-1 bg-blue-50 text-primary px-3 py-2 rounded-sm hover:bg-blue-100 text-sm flex items-center justify-center"
                          >
                            <Edit size={16} className="mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteService(service.id)}
                            className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-sm hover:bg-red-100 text-sm flex items-center justify-center"
                          >
                            <Trash2 size={16} className="mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Packages Tab */}
            {activeTab === 'packages' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-semibold text-primary">
                    All Packages
                  </h2>
                  <button onClick={() => openPackageModal()} className="btn-primary text-sm flex items-center">
                    <Plus size={18} className="mr-2" />
                    Create New Package
                  </button>
                </div>

                {packages.length === 0 ? (
                  <div className="text-center py-12">
                    <PackageIcon size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No packages yet</p>
                    <button onClick={() => openPackageModal()} className="btn-primary text-sm">
                      Create Your First Package
                    </button>
                  </div>
                ) : (
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
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm text-primary mb-2">
                            Inclusions:
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {pkg.inclusions.map((inc, i) => (
                              <li key={i}>• {inc}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openPackageModal(pkg)}
                            className="bg-blue-50 text-primary px-4 py-2 rounded-sm hover:bg-blue-100 text-sm flex items-center"
                          >
                            <Edit size={16} className="mr-2" />
                            Edit Package
                          </button>
                          <button
                            onClick={() => deletePackage(pkg.id)}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-sm hover:bg-red-100 text-sm flex items-center"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete Package
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* Service Modal */}
      {showServiceModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowServiceModal(false)}
        >
          <div
            className="bg-white rounded-sm max-w-2xl w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-semibold text-primary">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button
                onClick={() => setShowServiceModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={saveService} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, name: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Description
                </label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, description: e.target.value })
                  }
                  className="input-field"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Price (ZAR)
                  </label>
                  <input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, price: e.target.value })
                    }
                    className="input-field"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Category
                  </label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        category: e.target.value as 'attraction' | 'transport' | 'lodging',
                      })
                    }
                    className="input-field"
                  >
                    <option value="attraction">Attraction</option>
                    <option value="transport">Transport</option>
                    <option value="lodging">Lodging</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={serviceForm.is_active}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, is_active: e.target.checked })
                  }
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">
                  Active (visible on website)
                </label>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="flex-1 btn-primary">
                  {editingService ? 'Update Service' : 'Add Service'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {showPackageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPackageModal(false)}
        >
          <div
            className="bg-white rounded-sm max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-semibold text-primary">
                {editingPackage ? 'Edit Package' : 'Create New Package'}
              </h2>
              <button
                onClick={() => setShowPackageModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={savePackage} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Package Name
                </label>
                <input
                  type="text"
                  value={packageForm.name}
                  onChange={(e) =>
                    setPackageForm({ ...packageForm, name: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Description
                </label>
                <textarea
                  value={packageForm.description}
                  onChange={(e) =>
                    setPackageForm({ ...packageForm, description: e.target.value })
                  }
                  className="input-field"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={packageForm.duration_days}
                    onChange={(e) =>
                      setPackageForm({
                        ...packageForm,
                        duration_days: parseInt(e.target.value),
                      })
                    }
                    className="input-field"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Price (ZAR)
                  </label>
                  <input
                    type="number"
                    value={packageForm.price}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, price: e.target.value })
                    }
                    className="input-field"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Inclusions
                </label>
                <div className="space-y-2">
                  {packageForm.inclusions.map((inclusion, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={inclusion}
                        onChange={(e) => updateInclusion(index, e.target.value)}
                        className="flex-1 input-field"
                        placeholder="e.g., Airport transfers"
                      />
                      {packageForm.inclusions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInclusion(index)}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-sm hover:bg-red-100"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addInclusion}
                  className="mt-2 text-accent-orange hover:text-accent-teal text-sm font-medium flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add Inclusion
                </button>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={packageForm.is_active}
                  onChange={(e) =>
                    setPackageForm({ ...packageForm, is_active: e.target.checked })
                  }
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">
                  Active (visible on website)
                </label>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="flex-1 btn-primary">
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPackageModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}