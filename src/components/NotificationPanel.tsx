import { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase, Notification } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type NotificationPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange: (count: number) => void;
};

export default function NotificationPanel({ isOpen, onClose, onUnreadCountChange }: NotificationPanelProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      loadNotifications();
    }
  }, [isOpen, user]);

  async function loadNotifications() {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data);
      const unreadCount = data.filter(n => !n.is_read).length;
      onUnreadCountChange(unreadCount);
    }
    setLoading(false);
  }

  async function markAsRead(notificationId: string) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
    );

    const unreadCount = notifications.filter(n => !n.is_read && n.id !== notificationId).length;
    onUnreadCountChange(unreadCount);
  }

  async function markAllAsRead() {
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    onUnreadCountChange(0);
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'payment':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'cancellation':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Notifications</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {notifications.some(n => !n.is_read) && (
          <div className="px-6 py-3 border-b border-gray-200">
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 font-semibold hover:text-blue-700"
            >
              Mark all as read
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Clock className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No notifications yet</p>
              <p className="text-sm mt-2">We'll notify you when something happens</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-semibold text-gray-900">
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.created_at!).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
