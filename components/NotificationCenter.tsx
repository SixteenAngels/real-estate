import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, X, Check, CheckCheck, Trash2, Settings, Filter, Search, MoreHorizontal, User, Home, MessageSquare, Calendar, AlertTriangle, Info } from 'lucide-react';
import { usePushNotifications } from './PushNotificationService';
import { useAuth } from './auth/AuthProvider';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'chat_message' | 'booking_notification' | 'property_update' | 'admin_notification' | 'system_announcement' | 'host_notification' | 'manager_notification' | 'general';
  read: boolean;
  createdAt: string;
  data?: any;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function NotificationCenter({ isOpen, onClose, className = '' }: NotificationCenterProps) {
  const { user: currentUser } = useAuth();
  const { 
    getNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification,
    isEnabled,
    toggleNotifications 
  } = usePushNotifications();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const notificationCenterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadNotifications();
    }
  }, [isOpen, currentUser, filter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationCenterRef.current && !notificationCenterRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const fetchedNotifications = await getNotifications({
        limit: 50,
        unreadOnly: filter === 'unread',
        type: filter !== 'all' && filter !== 'unread' ? filter : undefined
      });
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true } 
            : notif
        )
      );
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleBulkAction = async (action: 'read' | 'delete') => {
    const promises = Array.from(selectedNotifications).map(id => {
      if (action === 'read') {
        return markNotificationAsRead(id);
      } else {
        return deleteNotification(id);
      }
    });

    try {
      await Promise.all(promises);
      
      if (action === 'read') {
        setNotifications(prev => 
          prev.map(notif => 
            selectedNotifications.has(notif.id) 
              ? { ...notif, read: true } 
              : notif
          )
        );
        toast.success(`Marked ${selectedNotifications.size} notifications as read`);
      } else {
        setNotifications(prev => 
          prev.filter(notif => !selectedNotifications.has(notif.id))
        );
        toast.success(`Deleted ${selectedNotifications.size} notifications`);
      }
      
      setSelectedNotifications(new Set());
    } catch (error) {
      toast.error(`Failed to ${action} notifications`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat_message':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'booking_notification':
        return <Calendar className="w-4 h-4 text-green-500" />;
      case 'property_update':
        return <Home className="w-4 h-4 text-purple-500" />;
      case 'admin_notification':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'system_announcement':
        return <Info className="w-4 h-4 text-blue-600" />;
      case 'host_notification':
        return <User className="w-4 h-4 text-orange-500" />;
      case 'manager_notification':
        return <Settings className="w-4 h-4 text-indigo-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'chat_message':
        return 'bg-blue-50 border-blue-200';
      case 'booking_notification':
        return 'bg-green-50 border-green-200';
      case 'property_update':
        return 'bg-purple-50 border-purple-200';
      case 'admin_notification':
        return 'bg-red-50 border-red-200';
      case 'system_announcement':
        return 'bg-blue-50 border-blue-300';
      case 'host_notification':
        return 'bg-orange-50 border-orange-200';
      case 'manager_notification':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (searchQuery && !notif.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !notif.body.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
      >
        <motion.div
          ref={notificationCenterRef}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className={`fixed right-0 top-0 h-full w-96 bg-background border-l shadow-2xl flex flex-col ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <h2 className="font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Controls */}
          <div className="p-4 border-b space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted rounded-md border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'chat_message', label: 'Chat' },
                { key: 'booking_notification', label: 'Bookings' },
                { key: 'system_announcement', label: 'System' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    filter === key 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedNotifications.size > 0 && (
                  <>
                    <button
                      onClick={() => handleBulkAction('read')}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      <Check className="w-3 h-3" />
                      Mark Read ({selectedNotifications.size})
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete ({selectedNotifications.size})
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-primary hover:bg-primary/10 rounded-md"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Read All
                  </button>
                )}
              </div>
            </div>

            {/* Notification toggle */}
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
              <span className="text-sm">Push Notifications</span>
              <button
                onClick={toggleNotifications}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  isEnabled ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    isEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4">
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <BellOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium mb-1">No notifications</p>
                <p className="text-sm">
                  {searchQuery ? 'No notifications match your search.' : 'You\'re all caught up!'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 hover:bg-muted/30 transition-colors cursor-pointer ${
                      !notification.read ? 'border-l-4 border-primary' : ''
                    } ${getNotificationColor(notification.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Selection checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedNotifications);
                          if (e.target.checked) {
                            newSelected.add(notification.id);
                          } else {
                            newSelected.delete(notification.id);
                          }
                          setSelectedNotifications(newSelected);
                        }}
                        className="mt-1 rounded border-gray-300"
                      />

                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={`text-sm font-medium line-clamp-2 ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.read && (
                              <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Show more options menu
                              }}
                              className="p-0.5 hover:bg-muted-foreground/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.body}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>

                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="p-1 hover:bg-background/80 rounded text-xs text-primary"
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                              className="p-1 hover:bg-background/80 rounded text-xs text-destructive"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <button
              onClick={() => {
                // Navigate to full notifications page
                toast.info('Full notifications page coming soon!');
              }}
              className="w-full text-sm text-primary hover:underline"
            >
              View All Notifications
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Notification Badge Component
export function NotificationBadge() {
  const { user: currentUser } = useAuth();
  const { getNotifications } = usePushNotifications();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      const updateUnreadCount = async () => {
        const notifications = await getNotifications({ unreadOnly: true, limit: 100 });
        setUnreadCount(notifications.length);
      };

      updateUnreadCount();
      
      // Update every 30 seconds
      const interval = setInterval(updateUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser, getNotifications]);

  if (unreadCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}