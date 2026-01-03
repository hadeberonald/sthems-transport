'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase, Service, Package } from '@/lib/supabase';
import { Calendar, Users, Check, ArrowLeft } from 'lucide-react';

function BookingContent() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get('package');
  const bookingType = searchParams.get('type') || 'package';

  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    numberOfGuests: 1,
    checkInDate: '',
    checkOutDate: '',
    specialRequests: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (packageId && packages.length > 0) {
      const pkg = packages.find(p => p.id === packageId);
      if (pkg) setSelectedPackage(pkg);
    }
  }, [packageId, packages]);

  const fetchData = async () => {
    const [servicesRes, packagesRes] = await Promise.all([
      supabase.from('services').select('*').eq('is_active', true),
      supabase.from('packages').select('*').eq('is_active', true),
    ]);

    if (servicesRes.data) setServices(servicesRes.data);
    if (packagesRes.data) setPackages(packagesRes.data);
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const calculateTotal = () => {
    if (bookingType === 'package' && selectedPackage) {
      return selectedPackage.price * formData.numberOfGuests;
    } else {
      const selectedServiceObjects = services.filter(s =>
        selectedServices.includes(s.id)
      );
      const servicesTotal = selectedServiceObjects.reduce(
        (sum, s) => sum + s.price,
        0
      );
      
      // Calculate lodging if dates are selected
      let lodgingCost = 0;
      if (formData.checkInDate && formData.checkOutDate) {
        const checkIn = new Date(formData.checkInDate);
        const checkOut = new Date(formData.checkOutDate);
        const nights = Math.max(
          0,
          Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        );
        const lodgingService = selectedServiceObjects.find(
          s => s.category === 'lodging'
        );
        if (lodgingService) {
          lodgingCost = lodgingService.price * nights;
        }
      }

      return (servicesTotal + lodgingCost) * formData.numberOfGuests;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingData = {
        booking_type: bookingType,
        package_id: selectedPackage?.id || null,
        service_ids: bookingType === 'flexible' ? selectedServices : null,
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        number_of_guests: formData.numberOfGuests,
        check_in_date: formData.checkInDate,
        check_out_date: formData.checkOutDate,
        total_price: calculateTotal(),
        special_requests: formData.specialRequests,
        status: 'pending',
      };

      const { error } = await supabase.from('bookings').insert([bookingData]);

      if (error) throw error;

      setSuccess(true);
      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        numberOfGuests: 1,
        checkInDate: '',
        checkOutDate: '',
        specialRequests: '',
      });
      setSelectedServices([]);
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center py-32">
          <div className="section-container max-w-2xl text-center">
            <div className="bg-white p-12 rounded-sm shadow-xl">
              <div className="w-20 h-20 bg-accent-teal rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-white" />
              </div>
              <h1 className="text-4xl font-serif font-semibold text-primary mb-4">
                Booking Received
              </h1>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Thank you for your booking request. We have received your details and will
                confirm availability within 24 hours via email.
              </p>
              <div className="space-y-4">
                <Link href="/" className="btn-primary inline-block">
                  Return to Home
                </Link>
                <p className="text-sm text-gray-500">
                  Booking Reference: #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <section className="py-32 min-h-screen">
      <div className="section-container max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center text-accent-orange hover:text-accent-teal transition-colors duration-300 mb-8"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="section-title">
            {bookingType === 'package' ? 'Book Your Package' : 'Custom Booking'}
          </h1>
          <div className="divider-accent mx-auto"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {bookingType === 'package'
              ? 'Complete the form below to reserve your all-inclusive experience'
              : 'Select services and customize your Johannesburg experience'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="card p-8 space-y-6">
              {/* Package Selection (if package booking) */}
              {bookingType === 'package' && (
                <div>
                  <label className="block text-sm font-semibold text-primary mb-3">
                    Select Package
                  </label>
                  <select
                    value={selectedPackage?.id || ''}
                    onChange={(e) => {
                      const pkg = packages.find(p => p.id === e.target.value);
                      setSelectedPackage(pkg || null);
                    }}
                    className="input-field"
                    required
                  >
                    <option value="">Choose a package...</option>
                    {packages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - R{pkg.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Service Selection (if flexible booking) */}
              {bookingType === 'flexible' && (
                <div>
                  <label className="block text-sm font-semibold text-primary mb-3">
                    Select Services
                  </label>
                  <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-sm p-4">
                    {services.map(service => (
                      <label
                        key={service.id}
                        className="flex items-start p-3 border border-gray-200 rounded-sm hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.id)}
                          onChange={() => toggleService(service.id)}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-primary">{service.name}</p>
                          <p className="text-sm text-gray-600">{service.description}</p>
                          <p className="text-sm font-semibold text-accent-orange mt-1">
                            R{service.price.toLocaleString()}
                            {service.category === 'lodging' && ' per night'}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, customerEmail: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, customerPhone: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfGuests}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfGuests: parseInt(e.target.value),
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) =>
                      setFormData({ ...formData, checkInDate: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={formData.checkOutDate}
                    onChange={(e) =>
                      setFormData({ ...formData, checkOutDate: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) =>
                    setFormData({ ...formData, specialRequests: e.target.value })
                  }
                  className="input-field min-h-32"
                  placeholder="Any special requirements or requests..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Submit Booking Request'}
              </button>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-xl font-serif font-semibold text-primary mb-6">
                Booking Summary
              </h3>

              {bookingType === 'package' && selectedPackage && (
                <div className="mb-6">
                  <h4 className="font-semibold text-primary mb-2">
                    {selectedPackage.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedPackage.duration_days} Day Experience
                  </p>
                  <div className="space-y-2">
                    {selectedPackage.inclusions.map((inc, i) => (
                      <div key={i} className="flex items-start text-sm">
                        <Check
                          size={16}
                          className="text-accent-teal mr-2 mt-0.5 flex-shrink-0"
                        />
                        <span className="text-gray-700">{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bookingType === 'flexible' && selectedServices.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-primary mb-3">Selected Services</h4>
                  <div className="space-y-2">
                    {services
                      .filter(s => selectedServices.includes(s.id))
                      .map(service => (
                        <div
                          key={service.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-700">{service.name}</span>
                          <span className="font-medium text-primary">
                            R{service.price.toLocaleString()}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Number of Guests</span>
                  <span className="font-medium">{formData.numberOfGuests}</span>
                </div>
                {formData.checkInDate && formData.checkOutDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">
                      {Math.max(
                        0,
                        Math.ceil(
                          (new Date(formData.checkOutDate).getTime() -
                            new Date(formData.checkInDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      )}{' '}
                      night(s)
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-primary pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-accent-orange">
                    R{calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-6 leading-relaxed">
                This booking is subject to availability. You will receive a confirmation
                email within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function BookingPage() {
  return (
    <main>
      <Navigation />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center py-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading booking form...</p>
          </div>
        </div>
      }>
        <BookingContent />
      </Suspense>
      <Footer />
    </main>
  );
}