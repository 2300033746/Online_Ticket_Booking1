import { useState } from 'react';
import { X, Plus, Minus, CreditCard, Calendar, MapPin } from 'lucide-react';
import { Event, Transport } from '../lib/supabase';

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  item: Event | Transport | null;
  type: 'event' | 'transport';
  onConfirm: (numberOfTickets: number, totalAmount: number) => void;
};

export default function BookingModal({ isOpen, onClose, item, type, onConfirm }: BookingModalProps) {
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !item) return null;

  const price = item.price;
  const totalAmount = price * numberOfTickets;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(numberOfTickets, totalAmount);
    setLoading(false);
    setNumberOfTickets(1);
  };

  const incrementTickets = () => {
    if (numberOfTickets < item.available_seats && numberOfTickets < 10) {
      setNumberOfTickets(numberOfTickets + 1);
    }
  };

  const decrementTickets = () => {
    if (numberOfTickets > 1) {
      setNumberOfTickets(numberOfTickets - 1);
    }
  };

  const isEvent = type === 'event';
  const event = isEvent ? (item as Event) : null;
  const transport = !isEvent ? (item as Transport) : null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Confirm Booking</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {isEvent && event ? (
              <div className="space-y-4">
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt={event.name}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                )}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.name}</h3>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-700">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                      <span>{new Date(event.event_date).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : transport ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">From</p>
                      <p className="text-lg font-bold text-gray-900">{transport.from_location}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transport.departure_time).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="px-4">
                      <div className="w-12 h-0.5 bg-gray-300"></div>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm text-gray-500 mb-1">To</p>
                      <p className="text-lg font-bold text-gray-900">{transport.to_location}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transport.arrival_time).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-sm text-gray-500">Operator</p>
                    <p className="font-semibold text-gray-900">{transport.operator_name}</p>
                    <p className="text-sm text-gray-600 mt-1 capitalize">{transport.type}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-blue-50 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-lg font-semibold text-gray-900">Number of Tickets</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={decrementTickets}
                    disabled={numberOfTickets <= 1}
                    className="w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-blue-600 font-bold transition-all"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-bold text-gray-900 w-12 text-center">{numberOfTickets}</span>
                  <button
                    onClick={incrementTickets}
                    disabled={numberOfTickets >= item.available_seats || numberOfTickets >= 10}
                    className="w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-blue-600 font-bold transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="border-t border-blue-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Price per ticket</span>
                  <span className="font-semibold">₹{price}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Number of tickets</span>
                  <span className="font-semibold">{numberOfTickets}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-blue-200">
                  <span>Total Amount</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>{loading ? 'Processing...' : `Pay ₹${totalAmount}`}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
