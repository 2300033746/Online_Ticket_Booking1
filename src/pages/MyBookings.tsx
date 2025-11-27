import { useEffect, useState } from 'react';
import { Calendar, MapPin, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase, Booking } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type MyBookingsProps = {
  onCancelBooking: (booking: Booking) => void;
};

export default function MyBookings({ onCancelBooking }: MyBookingsProps) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  async function loadBookings() {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        events(*),
        transport(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data as unknown as Booking[]);
    }
    setLoading(false);
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.booking_status === filter;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    const icons = {
      confirmed: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
    };
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const styles = {
      paid: 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      refunded: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold border ${styles[status as keyof typeof styles]}`}>
        <CreditCard className="w-4 h-4" />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
        <p className="text-orange-100 text-lg">View and manage all your bookings</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex gap-2">
          {['all', 'confirmed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status as typeof filter)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                filter === status
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No bookings found</p>
          <p className="text-gray-400 text-sm mt-2">Start booking events and transport to see them here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const isEvent = booking.booking_type === 'event';
            const item = isEvent ? booking.events : booking.transport;

            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {isEvent && booking.events
                              ? booking.events.name
                              : booking.transport
                              ? `${booking.transport.from_location} → ${booking.transport.to_location}`
                              : 'Booking'}
                          </h3>
                          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                            {booking.booking_type === 'event' ? 'Event' : 'Transport'}
                          </span>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {getStatusBadge(booking.booking_status)}
                          {getPaymentBadge(booking.payment_status)}
                        </div>
                      </div>

                      {isEvent && booking.events ? (
                        <div className="space-y-2 text-gray-700">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                            <span>{booking.events.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                            <span>{new Date(booking.events.event_date).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        </div>
                      ) : booking.transport ? (
                        <div className="space-y-2 text-gray-700">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                            <span>
                              {new Date(booking.transport.departure_time).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm">Operator: {booking.transport.operator_name}</p>
                        </div>
                      ) : null}

                      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Tickets</p>
                          <p className="text-lg font-bold text-gray-900">{booking.number_of_tickets}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Amount</p>
                          <p className="text-lg font-bold text-gray-900">₹{booking.total_amount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Booking Date</p>
                          <p className="text-sm text-gray-900">
                            {new Date(booking.booking_date).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Booking ID</p>
                          <p className="text-xs text-gray-600 font-mono">{booking.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </div>

                    {booking.booking_status === 'confirmed' && (
                      <div className="flex items-center">
                        <button
                          onClick={() => onCancelBooking(booking)}
                          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
