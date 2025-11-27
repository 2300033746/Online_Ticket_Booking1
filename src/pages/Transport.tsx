import { useEffect, useState } from 'react';
import { Bus, Train, Plane, MapPin, Clock, Search, Users } from 'lucide-react';
import { supabase, Transport } from '../lib/supabase';

type TransportProps = {
  onBookTransport: (transport: Transport) => void;
};

export default function TransportPage({ onBookTransport }: TransportProps) {
  const [transports, setTransports] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    loadTransports();
  }, []);

  async function loadTransports() {
    setLoading(true);
    const { data, error } = await supabase
      .from('transport')
      .select('*')
      .order('departure_time', { ascending: true });

    if (!error && data) {
      setTransports(data);
    }
    setLoading(false);
  }

  const types = ['All', 'Bus', 'Train', 'Flight'];

  const filteredTransports = transports.filter(transport => {
    const matchesSearch = transport.from_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transport.to_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transport.operator_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || transport.type.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const getTransportIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bus':
        return <Bus className="w-6 h-6" />;
      case 'train':
        return <Train className="w-6 h-6" />;
      case 'flight':
        return <Plane className="w-6 h-6" />;
      default:
        return <Bus className="w-6 h-6" />;
    }
  };

  const getTransportColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bus':
        return 'from-green-600 to-green-700';
      case 'train':
        return 'from-orange-600 to-orange-700';
      case 'flight':
        return 'from-blue-600 to-blue-700';
      default:
        return 'from-gray-600 to-gray-700';
    }
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
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Book Transport</h1>
        <p className="text-green-100 text-lg">Travel comfortably with our wide range of transport options</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by location or operator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedType === type
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredTransports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No transport options found matching your criteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransports.map((transport) => (
            <div
              key={transport.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${getTransportColor(transport.type)} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    {getTransportIcon(transport.type)}
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">From</p>
                      <div className="flex items-center text-gray-900">
                        <MapPin className="w-4 h-4 mr-2 text-green-600" />
                        <span className="font-semibold">{transport.from_location}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(transport.departure_time).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">To</p>
                      <div className="flex items-center text-gray-900">
                        <MapPin className="w-4 h-4 mr-2 text-red-600" />
                        <span className="font-semibold">{transport.to_location}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(transport.arrival_time).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">Details</p>
                      <p className="text-gray-900 font-semibold">{transport.operator_name}</p>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{transport.available_seats} seats available</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <div className="mb-3">
                      <span className="text-3xl font-bold text-gray-900">₹{transport.price}</span>
                      <span className="text-gray-500 text-sm block mt-1">per seat</span>
                    </div>
                    <button
                      onClick={() => onBookTransport(transport)}
                      className={`bg-gradient-to-r ${getTransportColor(transport.type)} text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all`}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
