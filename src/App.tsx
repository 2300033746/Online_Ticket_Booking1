import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Header from './components/Header';
import NotificationPanel from './components/NotificationPanel';
import Events from './pages/Events';
import TransportPage from './pages/Transport';
import MyBookings from './pages/MyBookings';
import BookingModal from './components/BookingModal';
import { Calendar, Bus, Ticket } from 'lucide-react';
import { Event, Transport, Booking, supabase } from './lib/supabase';

function Dashboard() {
  const { user, profile } = useAuth();
  const [currentPage, setCurrentPage] = useState<'events' | 'transport' | 'bookings'>('events');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    item: Event | Transport | null;
    type: 'event' | 'transport';
  }>({ isOpen: false, item: null, type: 'event' });
  const [refreshBookings, setRefreshBookings] = useState(0);

  const handleBookEvent = (event: Event) => {
    setBookingModal({ isOpen: true, item: event, type: 'event' });
  };

  const handleBookTransport = (transport: Transport) => {
    setBookingModal({ isOpen: true, item: transport, type: 'transport' });
  };

  const handleConfirmBooking = async (numberOfTickets: number, totalAmount: number) => {
    if (!user || !bookingModal.item) return;

    const bookingData = {
      user_id: user.id,
      booking_type: bookingModal.type,
      event_id: bookingModal.type === 'event' ? bookingModal.item.id : null,
      transport_id: bookingModal.type === 'transport' ? bookingModal.item.id : null,
      number_of_tickets: numberOfTickets,
      total_amount: totalAmount,
      payment_status: 'paid',
      booking_status: 'confirmed',
    };

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (!error && booking) {
      const itemName = bookingModal.type === 'event'
        ? (bookingModal.item as Event).name
        : `${(bookingModal.item as Transport).from_location} → ${(bookingModal.item as Transport).to_location}`;

      const notificationMessage = `Your booking for ${itemName} has been confirmed! ${numberOfTickets} ticket(s) - ₹${totalAmount}. ${profile?.village ? `Location: ${profile.village}${profile?.state ? ', ' + profile.state : ''}` : ''}`;

      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Booking Confirmed',
        message: notificationMessage,
        type: 'booking',
        booking_id: booking.id,
      });

      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Payment Successful',
        message: `Payment of ₹${totalAmount} received for ${itemName}. Booked by: ${profile?.full_name}${profile?.village ? ' from ' + profile.village : ''}${profile?.state ? ', ' + profile.state : ''}`,
        type: 'payment',
        booking_id: booking.id,
      });

      await supabase
        .from(bookingModal.type === 'event' ? 'events' : 'transport')
        .update({ available_seats: bookingModal.item.available_seats - numberOfTickets })
        .eq('id', bookingModal.item.id);

      setUnreadCount(prev => prev + 2);
      setRefreshBookings(prev => prev + 1);
    }

    setBookingModal({ isOpen: false, item: null, type: 'event' });
  };

  const handleCancelBooking = async (booking: Booking) => {
    const confirmed = window.confirm('Are you sure you want to cancel this booking? The amount will be refunded.');
    if (!confirmed) return;

    await supabase
      .from('bookings')
      .update({
        booking_status: 'cancelled',
        payment_status: 'refunded',
      })
      .eq('id', booking.id);

    if (booking.event_id && booking.events) {
      await supabase
        .from('events')
        .update({ available_seats: booking.events.available_seats + booking.number_of_tickets })
        .eq('id', booking.event_id);
    } else if (booking.transport_id && booking.transport) {
      await supabase
        .from('transport')
        .update({ available_seats: booking.transport.available_seats + booking.number_of_tickets })
        .eq('id', booking.transport_id);
    }

    const itemName = booking.booking_type === 'event' && booking.events
      ? booking.events.name
      : booking.transport
      ? `${booking.transport.from_location} → ${booking.transport.to_location}`
      : 'Booking';

    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Booking Cancelled',
      message: `Your booking for ${itemName} has been cancelled. Refund of ₹${booking.total_amount} will be processed within 5-7 business days. ${profile?.village ? `Refund for: ${profile.full_name}, ${profile.village}${profile?.state ? ', ' + profile.state : ''}` : ''}`,
      type: 'cancellation',
      booking_id: booking.id,
    });

    setUnreadCount(prev => prev + 1);
    setRefreshBookings(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onShowNotifications={() => setShowNotifications(true)}
        unreadCount={unreadCount}
      />

      <div className="flex">
        <div className="w-64 bg-white shadow-md min-h-screen p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setCurrentPage('events')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                currentPage === 'events'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Discover Events</span>
            </button>
            <button
              onClick={() => setCurrentPage('transport')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                currentPage === 'transport'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Bus className="w-5 h-5" />
              <span className="font-medium">Book Transport</span>
            </button>
            <button
              onClick={() => setCurrentPage('bookings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                currentPage === 'bookings'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Ticket className="w-5 h-5" />
              <span className="font-medium">My Bookings</span>
            </button>
          </nav>
        </div>

        <div className="flex-1 p-8">
          {currentPage === 'events' && <Events onBookEvent={handleBookEvent} />}
          {currentPage === 'transport' && <TransportPage onBookTransport={handleBookTransport} />}
          {currentPage === 'bookings' && (
            <MyBookings key={refreshBookings} onCancelBooking={handleCancelBooking} />
          )}
        </div>
      </div>

      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onUnreadCountChange={setUnreadCount}
      />

      <BookingModal
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal({ isOpen: false, item: null, type: 'event' })}
        item={bookingModal.item}
        type={bookingModal.type}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return showLogin ? (
      <Login onNavigateToSignUp={() => setShowLogin(false)} />
    ) : (
      <SignUp onNavigateToLogin={() => setShowLogin(true)} />
    );
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
