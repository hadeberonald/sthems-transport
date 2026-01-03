-- Supabase Database Schema for Sthem's and Save's Transport Service
-- Run these commands in your Supabase SQL editor

-- Services Table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) CHECK (category IN ('attraction', 'transport', 'lodging')),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packages Table
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  inclusions TEXT[], -- Array of strings
  service_ids UUID[], -- Array of service IDs
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guest House Rooms Table
CREATE TABLE guesthouse_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number VARCHAR(50) NOT NULL UNIQUE,
  room_type VARCHAR(100) NOT NULL,
  capacity INTEGER NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  amenities TEXT[],
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_type VARCHAR(20) CHECK (booking_type IN ('package', 'flexible')),
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  service_ids UUID[], -- For flexible bookings
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  number_of_guests INTEGER NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery Images Table
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  image_url TEXT NOT NULL,
  category VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_packages_active ON packages(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE guesthouse_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can view active services" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active packages" ON packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view available rooms" ON guesthouse_rooms
  FOR SELECT USING (is_available = true);

CREATE POLICY "Public can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view gallery" ON gallery_images
  FOR SELECT USING (true);

-- Insert sample data
INSERT INTO services (name, description, price, category) VALUES
  ('Airport Shuttle', 'Comfortable shuttle service to and from OR Tambo International Airport', 350.00, 'transport'),
  ('Gautrain Terminal Transfer', 'Transfer service to any Gautrain station in Johannesburg', 200.00, 'transport'),
  ('Ukutula Lodge Visit', 'Full day tour to Ukutula Conservation Center with lion interaction', 1500.00, 'attraction'),
  ('Gold Reef City Tour', 'Experience the theme park and gold mining heritage', 800.00, 'attraction'),
  ('Johannesburg City Tour', 'Guided tour of major Johannesburg landmarks including Constitution Hill, Maboneng, and Nelson Mandela Square', 1200.00, 'attraction'),
  ('Standard Room', 'Comfortable room with en-suite bathroom, WiFi, and breakfast', 800.00, 'lodging'),
  ('Deluxe Room', 'Spacious room with king bed, en-suite bathroom, mini-bar, and breakfast', 1200.00, 'lodging');

INSERT INTO packages (name, description, duration_days, price, inclusions) VALUES
  ('All-Inclusive Johannesburg Experience', 
   'Complete 3-day Johannesburg adventure including accommodation, tours, and transport',
   3,
   5500.00,
   ARRAY[
     'Airport shuttle service (arrival and departure)',
     '2 nights accommodation in our guesthouse',
     'Johannesburg city landmarks tour',
     'Ukutula Conservation Center visit',
     'Gold Reef City tour',
     'Daily breakfast',
     'All transport between attractions'
   ]);

INSERT INTO guesthouse_rooms (room_number, room_type, capacity, price_per_night, amenities) VALUES
  ('101', 'Standard Room', 2, 800.00, ARRAY['WiFi', 'En-suite Bathroom', 'TV', 'Air Conditioning', 'Breakfast Included']),
  ('102', 'Standard Room', 2, 800.00, ARRAY['WiFi', 'En-suite Bathroom', 'TV', 'Air Conditioning', 'Breakfast Included']),
  ('201', 'Deluxe Room', 2, 1200.00, ARRAY['WiFi', 'En-suite Bathroom', 'TV', 'Air Conditioning', 'Mini-bar', 'King Bed', 'Breakfast Included']),
  ('202', 'Deluxe Room', 3, 1200.00, ARRAY['WiFi', 'En-suite Bathroom', 'TV', 'Air Conditioning', 'Mini-bar', 'Extra Bed', 'Breakfast Included']);
