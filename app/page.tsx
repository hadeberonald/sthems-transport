'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase, Service, Package } from '@/lib/supabase';
import { MapPin, Clock, Users, Check } from 'lucide-react';

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchServices();
    fetchPackages();
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (data) setServices(data);
  };

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (data) setPackages(data);
  };

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'lodging', label: 'Accommodation' },
    { id: 'transport', label: 'Transport' },
    { id: 'attraction', label: 'Attractions' },
  ];

  return (
    <main>
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0 bg-primary opacity-95"></div>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url(/images/hero-pattern.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>

        {/* Content */}
        <div className="relative z-10 section-container text-center text-white py-32">
          <div className="animate-fade-in">
            <p className="text-accent-orange font-medium tracking-widest text-sm mb-6 uppercase">
              Premium Hospitality in Johannesburg
            </p>
            <h1 className="text-5xl md:text-7xl font-serif font-light mb-6 leading-tight">
              Experience the Heart
              <br />
              <span className="text-gradient font-normal">of South Africa</span>
            </h1>
            <div className="divider-accent mx-auto"></div>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
              Discover Johannesburg with our all-inclusive packages featuring accommodation,
              expert-guided tours, and seamless transport services
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/booking" className="btn-primary animate-slide-up">
                Book Your Experience
              </Link>
              <Link href="#packages" className="btn-secondary animate-slide-up animate-delay-100">
                Explore Packages
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20 animate-slide-up animate-delay-200">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-sm border border-white border-opacity-20 hover-lift">
              <MapPin className="text-accent-orange mx-auto mb-4" size={32} />
              <h3 className="text-lg font-semibold mb-2">Prime Location</h3>
              <p className="text-gray-300 text-sm">South Johannesburg with easy access to major attractions</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-sm border border-white border-opacity-20 hover-lift">
              <Users className="text-accent-orange mx-auto mb-4" size={32} />
              <h3 className="text-lg font-semibold mb-2">Expert Guides</h3>
              <p className="text-gray-300 text-sm">Knowledgeable local guides for authentic experiences</p>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-24 bg-white">
        {/* Flexible Booking Option */}
          <div className="mt-12 text-center p-12 bg-gradient-to-r from-primary to-primary-dark rounded-sm text-white animate-slide-up">
            <h3 className="text-3xl font-serif font-semibold mb-4">Need Something Different?</h3>
            <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
              Build your own experience with our flexible booking option. Choose your accommodation,
              select specific tours, and customize your transport needs.
            </p>
            <Link href="/booking?type=flexible" className="btn-secondary bg-white text-primary hover:bg-gray-100">
              Customize
            </Link>
          </div>
        <div className="section-container">
          <div className="text-center mb-16 animate-slide-up">
            <p className="text-accent-orange font-medium tracking-widest text-sm mb-4 uppercase">
              Curated Experiences
            </p>
            <h2 className="section-title">Tour Packages</h2>
            <div className="divider-accent mx-auto"></div>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Carefully designed packages that showcase the best of Johannesburg
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {packages.map((pkg, index) => (
              <div
                key={pkg.id}
                className="card p-8 hover-lift animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-serif font-semibold text-primary mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {pkg.duration_days} Day{pkg.duration_days > 1 ? 's' : ''} Experience
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-accent-orange">
                      R{pkg.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">per person</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">{pkg.description}</p>

                <div className="space-y-3 mb-8">
                  <h4 className="font-semibold text-primary mb-3">Inclusions:</h4>
                  {pkg.inclusions.map((inclusion, i) => (
                    <div key={i} className="flex items-start">
                      <Check className="text-accent-teal mr-3 mt-1 flex-shrink-0" size={18} />
                      <span className="text-gray-700 text-sm">{inclusion}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/booking?package=${pkg.id}`}
                  className="btn-primary w-full text-center block"
                >
                  Book This Package
                </Link>
              </div>
            ))}
          </div>

          
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-16 animate-slide-up">
            <p className="text-accent-orange font-medium tracking-widest text-sm mb-4 uppercase">
              What We Offer
            </p>
            <h2 className="section-title">Our Services</h2>
            <div className="divider-accent mx-auto"></div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-3 rounded-sm font-medium transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? 'bg-accent-orange text-white shadow-lg'
                    : 'bg-white text-primary hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => (
              <div
                key={service.id}
                className="card p-6 hover-lift animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-full h-48 bg-gray-200 mb-6 rounded-sm overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-accent-orange to-accent-teal opacity-20"></div>
                </div>
                <h3 className="text-xl font-serif font-semibold text-primary mb-2">
                  {service.name}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-accent-orange">
                    R{service.price.toLocaleString()}
                  </p>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    {service.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-white">
        <div className="section-container">
          <div className="text-center mb-16 animate-slide-up">
            <p className="text-accent-orange font-medium tracking-widest text-sm mb-4 uppercase">
              Visual Journey
            </p>
            <h2 className="section-title">Gallery</h2>
            <div className="divider-accent mx-auto"></div>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Glimpses of the experiences that await you
            </p>
          </div>

          {/* Gallery Grid - Placeholder structure */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
              <div
                key={item}
                className="relative aspect-square bg-gray-200 rounded-sm overflow-hidden group cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent-orange via-primary to-accent-teal opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white font-serif text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Gallery Image {item}
                  </p>
                </div>
              </div>
            ))}
          </div>

          
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-primary text-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <p className="text-accent-orange font-medium tracking-widest text-sm mb-4 uppercase">
              Get In Touch
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-6">
              Ready to Begin Your Journey?
            </h2>
            <div className="divider-accent mx-auto"></div>
            <p className="text-gray-300 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              Contact us today to book your Johannesburg experience or to learn more about
              our services and packages
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/booking" className="btn-primary">
                Book Online Now
              </Link>
              <a href="tel:+27XXXXXXXXX" className="btn-secondary">
                Call Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
