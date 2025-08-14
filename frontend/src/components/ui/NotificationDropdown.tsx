import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../Redux/hooks';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../Redux/store';
import { fetchNotifications, markAsRead, markAllAsRead as markAllAsReadAction } from '../../Redux/notificationSlice/notificationSlice';
import { getSocket } from '../../lib/socket';
import { Bell, X, Calendar, MessageSquare, Star, Settings, Check } from 'lucide-react';
import type { Notification, NotificationType } from '../../types/data/notification';

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({ className = '' }: NotificationDropdownProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { notifications, loading } = useAppSelector((state: RootState) => state.notification);
  
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  // Get unread notifications count
  useEffect(() => {
    const unread = notifications.filter(notif => !notif.isRead).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Initialize socket connection
  useEffect(() => {
    if (!user?.id) return;

    // Connect to notification socket
    socketRef.current = getSocket('/notifications');
    
    // Connect the socket
    socketRef.current.connect();
    
    // Join user to notification room after connection
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-user', user.id);
    });

    // Listen for new notifications
    socketRef.current.on('new-notification', (_notification: Notification) => {
      dispatch(fetchNotifications());
    });

    // Listen for notification read confirmation (no-op)
    socketRef.current.on('notification-read', (_data: { notificationId: number }) => {});

    // Listen for connection confirmation (no-op)
    socketRef.current.on('joined', (_data: { userId: number, role: string }) => {});

    // Listen for errors (no-op)
    socketRef.current.on('error', (_error: { message: string }) => {});

    // Fetch initial notifications
    dispatch(fetchNotifications());

    // Cleanup on unmount
    return () => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.disconnect();
      }
    };
  }, [user?.id, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await dispatch(markAsRead(notification.id)).unwrap();
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'APPOINTMENT':
        // Navigate to appointments page
        navigate(user?.role === 'DOCTOR' ? '/doctor/appointments' : '/patient/appointments');
        break;
      case 'MESSAGE':
        // Navigate to messages page
        navigate(user?.role === 'DOCTOR' ? '/doctor/messages' : '/patient/messages');
        break;
      case 'REVIEW':
        // Navigate to reviews page (for both doctors and patients)
        navigate(user?.role === 'DOCTOR' ? '/doctor/reviews' : '/patient/reviews');
        break;
      case 'SYSTEM':
        // System notifications don't navigate
        break;
    }

    setIsOpen(false);
  };

  const markAllAsRead = async () => {
    await dispatch(markAllAsReadAction()).unwrap();
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'APPOINTMENT':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'MESSAGE':
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'REVIEW':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'SYSTEM':
        return <Settings className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getNotificationTitle = (type: NotificationType) => {
    switch (type) {
      case 'APPOINTMENT':
        return 'Appointment';
      case 'MESSAGE':
        return 'Message';
      case 'REVIEW':
        return 'Review';
      case 'SYSTEM':
        return 'System';
      default:
        return 'Notification';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {getNotificationTitle(notification.type)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.content}
                        </p>
                        {!notification.isRead && (
                          <div className="flex items-center gap-1 mt-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-blue-600">New</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  // Navigate to notifications page or show all notifications
                  navigate(user?.role === 'DOCTOR' ? '/doctor/notifications' : '/patient/notifications');
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-800 text-center"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
