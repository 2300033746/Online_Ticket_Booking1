import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase, Notification } from '../lib/supabase';

type HeaderProps = {
  onShowNotifications: () => void;
  unreadCount: number;
};

export default function Header({ onShowNotifications, unreadCount }: HeaderProps) {
  const { profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              TicketBooking
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onShowNotifications}
              className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{profile?.full_name}</span>
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{profile?.full_name}</p>
                      <p className="text-xs text-gray-500 mt-1">{profile?.email}</p>
                      {profile?.phone && (
                        <p className="text-xs text-gray-500 mt-1">Phone: {profile.phone}</p>
                      )}
                      {(profile?.village || profile?.state) && (
                        <p className="text-xs text-gray-500 mt-1">
                          {profile?.village && `${profile.village}`}
                          {profile?.village && profile?.state && ', '}
                          {profile?.state}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
