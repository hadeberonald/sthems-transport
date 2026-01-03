'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-serif font-semibold mb-4">
              Sthem's & Sabe's
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Premium guesthouse accommodation and transportation services in the heart of Johannesburg.
            </p>
            <div className="divider-accent"></div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 tracking-wide">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-accent-orange transition-colors duration-300 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#services" className="text-gray-300 hover:text-accent-orange transition-colors duration-300 text-sm">
                  Services
                </Link>
              </li>
              <li>
                <Link href="#packages" className="text-gray-300 hover:text-accent-orange transition-colors duration-300 text-sm">
                  Packages
                </Link>
              </li>
              <li>
                <Link href="#gallery" className="text-gray-300 hover:text-accent-orange transition-colors duration-300 text-sm">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-300 hover:text-accent-orange transition-colors duration-300 text-sm">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 tracking-wide">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="text-accent-teal mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-300 text-sm">Johannesburg, Gauteng, South Africa</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-accent-teal mr-3 flex-shrink-0" />
                <span className="text-gray-300 text-sm">+27 XX XXX XXXX</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-accent-teal mr-3 flex-shrink-0" />
                <span className="text-gray-300 text-sm">info@sthemsandsaves.co.za</span>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4 tracking-wide">Business Hours</h4>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Clock size={18} className="text-accent-teal mr-3 flex-shrink-0" />
                <span className="text-gray-300 text-sm">24/7 Guest Support</span>
              </li>
              <li className="text-gray-300 text-sm ml-9">
                Office: Mon - Fri
                <br />
                9:00 AM - 6:00 PM
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} Sthem's and Save's Transport Service. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
