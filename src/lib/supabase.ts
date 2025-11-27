import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  village?: string;
  state?: string;
  created_at?: string;
  updated_at?: string;
};

export type Event = {
  id: string;
  name: string;
  description: string;
  location: string;
  event_date: string;
  price: number;
  image_url?: string;
  category: string;
  available_seats: number;
  created_at?: string;
};

export type Transport = {
  id: string;
  type: string;
  from_location: string;
  to_location: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  operator_name: string;
  created_at?: string;
};

export type Booking = {
  id: string;
  user_id: string;
  booking_type: 'event' | 'transport';
  event_id?: string;
  transport_id?: string;
  number_of_tickets: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  booking_status: 'confirmed' | 'cancelled';
  booking_date: string;
  created_at?: string;
  events?: Event;
  transport?: Transport;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'cancellation';
  booking_id?: string;
  is_read: boolean;
  created_at?: string;
};
