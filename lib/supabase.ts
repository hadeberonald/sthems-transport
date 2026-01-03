import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'attraction' | 'transport' | 'lodging';
  image_url?: string;
  is_active: boolean;
  created_at: string;
};

export type Package = {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  price: number;
  inclusions: string[];
  service_ids: string[];
  is_active: boolean;
  image_url?: string;
  created_at: string;
};

export type Booking = {
  id: string;
  booking_type: 'package' | 'flexible';
  package_id?: string;
  service_ids?: string[];
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  number_of_guests: number;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  special_requests?: string;
  created_at: string;
  updated_at: string;
};

export type GuestHouseRoom = {
  id: string;
  room_number: string;
  room_type: string;
  capacity: number;
  price_per_night: number;
  is_available: boolean;
  amenities: string[];
  image_url?: string;
};
