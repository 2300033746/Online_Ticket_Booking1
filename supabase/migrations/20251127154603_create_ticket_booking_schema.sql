/*
  # Online Ticket Booking System Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `phone` (text)
      - `village` (text)
      - `state` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `events`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `location` (text)
      - `event_date` (timestamp)
      - `price` (numeric)
      - `image_url` (text)
      - `category` (text)
      - `available_seats` (integer)
      - `created_at` (timestamp)
    
    - `transport`
      - `id` (uuid, primary key)
      - `type` (text) - bus, train, flight
      - `from_location` (text)
      - `to_location` (text)
      - `departure_time` (timestamp)
      - `arrival_time` (timestamp)
      - `price` (numeric)
      - `available_seats` (integer)
      - `operator_name` (text)
      - `created_at` (timestamp)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `booking_type` (text) - event or transport
      - `event_id` (uuid, optional)
      - `transport_id` (uuid, optional)
      - `number_of_tickets` (integer)
      - `total_amount` (numeric)
      - `payment_status` (text) - pending, paid, refunded
      - `booking_status` (text) - confirmed, cancelled
      - `booking_date` (timestamp)
      - `created_at` (timestamp)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `message` (text)
      - `type` (text) - booking, payment, cancellation
      - `booking_id` (uuid, optional)
      - `is_read` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Public read access for events and transport listings
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  village text,
  state text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  event_date timestamptz NOT NULL,
  price numeric NOT NULL,
  image_url text,
  category text NOT NULL,
  available_seats integer NOT NULL DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS transport (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  from_location text NOT NULL,
  to_location text NOT NULL,
  departure_time timestamptz NOT NULL,
  arrival_time timestamptz NOT NULL,
  price numeric NOT NULL,
  available_seats integer NOT NULL DEFAULT 50,
  operator_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transport ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view transport"
  ON transport FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_type text NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  transport_id uuid REFERENCES transport(id) ON DELETE SET NULL,
  number_of_tickets integer NOT NULL DEFAULT 1,
  total_amount numeric NOT NULL,
  payment_status text NOT NULL DEFAULT 'paid',
  booking_status text NOT NULL DEFAULT 'confirmed',
  booking_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

INSERT INTO events (name, description, location, event_date, price, category, available_seats, image_url) VALUES
('Summer Music Festival', 'Experience the biggest music festival of the year with top artists', 'Mumbai, Maharashtra', '2025-12-15 18:00:00', 2500, 'Music', 5000, 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Tech Conference 2025', 'Join industry leaders discussing the future of technology', 'Bangalore, Karnataka', '2025-12-20 09:00:00', 1500, 'Technology', 1000, 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Food & Wine Festival', 'Savor delicious cuisines from around the world', 'Goa', '2025-12-25 12:00:00', 1200, 'Food', 2000, 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Art Exhibition', 'Discover contemporary art from talented artists', 'Delhi', '2026-01-05 10:00:00', 500, 'Art', 500, 'https://images.pexels.com/photos/1793034/pexels-photo-1793034.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Comedy Night Live', 'Laugh out loud with the best comedians in town', 'Pune, Maharashtra', '2025-12-18 20:00:00', 800, 'Comedy', 800, 'https://images.pexels.com/photos/3018993/pexels-photo-3018993.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Dance Competition', 'Watch amazing dance performances from talented groups', 'Chennai, Tamil Nadu', '2026-01-10 17:00:00', 600, 'Dance', 1200, 'https://images.pexels.com/photos/3721941/pexels-photo-3721941.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Literature Fest', 'Meet your favorite authors and attend book readings', 'Jaipur, Rajasthan', '2026-01-15 11:00:00', 400, 'Literature', 1500, 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Sports Championship', 'Watch thrilling sports action live', 'Kolkata, West Bengal', '2026-01-20 15:00:00', 1000, 'Sports', 10000, 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=800');

INSERT INTO transport (type, from_location, to_location, departure_time, arrival_time, price, available_seats, operator_name) VALUES
('Bus', 'Mumbai', 'Pune', '2025-12-15 06:00:00', '2025-12-15 09:00:00', 350, 40, 'Express Travels'),
('Bus', 'Delhi', 'Jaipur', '2025-12-16 07:00:00', '2025-12-16 12:00:00', 450, 45, 'Royal Roadways'),
('Train', 'Bangalore', 'Chennai', '2025-12-17 08:00:00', '2025-12-17 14:00:00', 600, 100, 'Shatabdi Express'),
('Train', 'Mumbai', 'Goa', '2025-12-18 10:00:00', '2025-12-18 20:00:00', 800, 150, 'Konkan Railway'),
('Flight', 'Delhi', 'Mumbai', '2025-12-19 09:00:00', '2025-12-19 11:30:00', 4500, 180, 'Air India'),
('Flight', 'Bangalore', 'Kolkata', '2025-12-20 14:00:00', '2025-12-20 17:00:00', 5200, 200, 'IndiGo'),
('Bus', 'Chennai', 'Bangalore', '2025-12-21 05:00:00', '2025-12-21 12:00:00', 500, 50, 'South Express'),
('Train', 'Kolkata', 'Delhi', '2025-12-22 16:00:00', '2025-12-23 08:00:00', 1200, 120, 'Rajdhani Express'),
('Flight', 'Pune', 'Goa', '2025-12-23 11:00:00', '2025-12-23 12:00:00', 3000, 100, 'SpiceJet'),
('Bus', 'Jaipur', 'Delhi', '2025-12-24 06:30:00', '2025-12-24 12:00:00', 400, 40, 'Rajasthan Travels');
