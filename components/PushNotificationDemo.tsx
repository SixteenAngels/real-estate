import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { usePushNotifications, NotificationSettings } from './PushNotificationService';
import { useAuth } from './auth/AuthProvider';
import { 
  Bell, 
  MessageSquare, 
  Calendar, 
  Home, 
  Users, 
  Settings, 
  AlertTriangle, 
  Send, 
  TestTube,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function PushNotificationDemo() {
  const { user: currentUser } = useAuth();
  const {
    isSupported,
    permission,
    isEnabled,
    isSubscribed,
    devices,
    sendTestNotification,
    sendChatNotification,
    sendBookingNotification,
    sendPropertyNotification,
    sendAdminNotification,
    sendSystemAnnouncement,
    sendHostNotification,
    sendManagerNotification,
    getNotifications,
    refreshDevices
  } = usePushNotifications();

  const [activeTab, setActiveTab] = useState('status');
  const [notifications, setNotifications] = useState([]);

  // Form states for different notification types
  const [chatForm, setChatForm] = useState({
    userId: currentUser?.id || '',
    senderId: currentUser?.id || '',
    senderName: currentUser?.name || '',
    roomId: 'room_123',
    roomName: 'General Discussion',
    roomType: 'group',
    messageContent: 'Hello! This is a test message.',
    messageType: 'text'
  });

  const [bookingForm, setBookingForm] = useState({
    userId: '',
    propertyId: 'prop_1',
    propertyTitle: 'Modern 3-Bedroom Apartment',
    bookingId: 'book_123',
    notificationType: 'booking_confirmed' as const,
    amount: 1200,
    checkinDate: new Date().toISOString().split('T')[0]
  });

  const [propertyForm, setPropertyForm] = useState({
    userId: '',
    propertyId: 'prop_1',
    propertyTitle: 'Modern 3-Bedroom Apartment',
    updateType: 'price_change' as const,
    message: 'Price has been reduced by 10%!'
  });

  const [adminForm, setAdminForm] = useState({
    targetRole: 'user',
    title: 'Important Update',
    body: 'Please review the new community guidelines.',
    notificationType: 'policy_update'
  });

  const [systemForm, setSystemForm] = useState({
    title: 'System Maintenance',
    body: 'Scheduled maintenance will occur tonight from 2-4 AM.',
    priority: 'normal' as const,
    targetRoles: ['user', 'host']
  });

  const [hostForm, setHostForm] = useState({
    hostId: '',
    notificationType: 'new_inquiry' as const,
    propertyId: 'prop_1',
    propertyTitle: 'Modern 3-Bedroom Apartment',
    guestName: 'John Smith'
  });

  const [managerForm, setManagerForm] = useState({
    managerId: '',
    notificationType: 'property_assigned' as const,
    propertyId: 'prop_1',
    propertyTitle: 'Modern 3-Bedroom Apartment',
    assignedBy: currentUser?.name || 'Admin'
  });

  const getStatusIcon = (status: boolean) => {
    return status ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const handleSendChatNotification = async () => {
    try {
      await sendChatNotification(chatForm);
      toast.success('Chat notification sent!');
    } catch (error) {
      toast.error('Failed to send chat notification');
    }
  };

  const handleSendBookingNotification = async () => {
    try {
      await sendBookingNotification(bookingForm);
      toast.success('Booking notification sent!');
    } catch (error) {
      toast.error('Failed to send booking notification');
    }
  };

  const handleSendPropertyNotification = async () => {
    try {
      await sendPropertyNotification(propertyForm);
      toast.success('Property notification sent!');
    } catch (error) {
      toast.error('Failed to send property notification');
    }
  };

  const handleSendAdminNotification = async () => {
    try {
      await sendAdminNotification(adminForm);
      toast.success('Admin notification sent!');
    } catch (error) {
      toast.error('Failed to send admin notification');
    }
  };

  const handleSendSystemAnnouncement = async () => {
    try {
      await sendSystemAnnouncement(systemForm);
      toast.success('System announcement sent!');
    } catch (error) {
      toast.error('Failed to send system announcement');
    }
  };

  const handleSendHostNotification = async () => {
    try {
      await sendHostNotification(hostForm);
      toast.success('Host notification sent!');
    } catch (error) {
      toast.error('Failed to send host notification');
    }
  };

  const handleSendManagerNotification = async () => {
    try {
      await sendManagerNotification(managerForm);
      toast.success('Manager notification sent!');
    } catch (error) {
      toast.error('Failed to send manager notification');
    }
  };

  const loadNotifications = async () => {
    try {
      const fetchedNotifications = await getNotifications({ limit: 20 });
      setNotifications(fetchedNotifications);
      toast.success(`Loaded ${fetchedNotifications.length} notifications`);
    } catch (error) {
      toast.error('Failed to load notifications');
    }
  };

  if (!currentUser) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Push Notifications Demo
          </CardTitle>
          <CardDescription>
            Please log in to test push notifications
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            PropertyHub Push Notifications Demo
          </CardTitle>
          <CardDescription>
            Test and manage comprehensive push notifications for all user roles and activities
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="property">Property</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(isSupported)}
                  <span className="text-sm">Browser Support</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(permission === 'granted')}
                  <span className="text-sm">Permission: {permission}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(isEnabled)}
                  <span className="text-sm">Enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(isSubscribed)}
                  <span className="text-sm">Subscribed</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Connected Devices ({devices.length})</h4>
                {devices.length > 0 ? (
                  <div className="grid gap-2">
                    {devices.map((device) => (
                      <div key={device.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          {getDeviceIcon(device.type)}
                          <div>
                            <p className="font-medium text-sm">{device.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Last seen: {new Date(device.lastSeen).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {device.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No devices connected</p>
                )}
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button onClick={sendTestNotification} variant="outline">
                  <TestTube className="w-4 h-4 mr-2" />
                  Send Test Notification
                </Button>
                <Button onClick={refreshDevices} variant="outline">
                  Refresh Devices
                </Button>
                <Button onClick={loadNotifications} variant="outline">
                  Load Notifications
                </Button>
              </div>

              {notifications.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Recent Notifications ({notifications.length})</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {notifications.slice(0, 5).map((notif: any) => (
                      <div key={notif.id} className="p-2 bg-muted/50 rounded text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{notif.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {notif.type}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs">{notif.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Notifications Tab */}
        <TabsContent value="chat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Chat Notifications
              </CardTitle>
              <CardDescription>
                Send push notifications for chat messages across all platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chat-userId">User ID</Label>
                  <Input
                    id="chat-userId"
                    value={chatForm.userId}
                    onChange={(e) => setChatForm(prev => ({ ...prev, userId: e.target.value }))}
                    placeholder="Target user ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chat-roomType">Room Type</Label>
                  <Select value={chatForm.roomType} onValueChange={(value) => setChatForm(prev => ({ ...prev, roomType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct Message</SelectItem>
                      <SelectItem value="group">Group Chat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chat-roomName">Room Name</Label>
                  <Input
                    id="chat-roomName"
                    value={chatForm.roomName}
                    onChange={(e) => setChatForm(prev => ({ ...prev, roomName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chat-senderName">Sender Name</Label>
                  <Input
                    id="chat-senderName"
                    value={chatForm.senderName}
                    onChange={(e) => setChatForm(prev => ({ ...prev, senderName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chat-content">Message Content</Label>
                <Textarea
                  id="chat-content"
                  value={chatForm.messageContent}
                  onChange={(e) => setChatForm(prev => ({ ...prev, messageContent: e.target.value }))}
                  placeholder="Enter message content..."
                />
              </div>
              <Button onClick={handleSendChatNotification} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send Chat Notification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Notifications Tab */}
        <TabsContent value="booking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Booking Notifications
              </CardTitle>
              <CardDescription>
                Send push notifications for booking-related activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="booking-userId">User ID</Label>
                  <Input
                    id="booking-userId"
                    value={bookingForm.userId}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, userId: e.target.value }))}
                    placeholder="Target user ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking-type">Notification Type</Label>
                  <Select value={bookingForm.notificationType} onValueChange={(value: any) => setBookingForm(prev => ({ ...prev, notificationType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking_request">Booking Request</SelectItem>
                      <SelectItem value="booking_confirmed">Booking Confirmed</SelectItem>
                      <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                      <SelectItem value="checkin_reminder">Check-in Reminder</SelectItem>
                      <SelectItem value="checkout_reminder">Check-out Reminder</SelectItem>
                      <SelectItem value="review_request">Review Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking-property">Property Title</Label>
                  <Input
                    id="booking-property"
                    value={bookingForm.propertyTitle}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, propertyTitle: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking-amount">Amount</Label>
                  <Input
                    id="booking-amount"
                    type="number"
                    value={bookingForm.amount}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <Button onClick={handleSendBookingNotification} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send Booking Notification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Property Notifications Tab */}
        <TabsContent value="property" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Property Notifications
              </CardTitle>
              <CardDescription>
                Send push notifications for property updates and changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property-userId">User ID</Label>
                  <Input
                    id="property-userId"
                    value={propertyForm.userId}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, userId: e.target.value }))}
                    placeholder="Target user ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-type">Update Type</Label>
                  <Select value={propertyForm.updateType} onValueChange={(value: any) => setPropertyForm(prev => ({ ...prev, updateType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_change">Price Change</SelectItem>
                      <SelectItem value="availability_change">Availability Change</SelectItem>
                      <SelectItem value="booking_confirmed">Booking Confirmed</SelectItem>
                      <SelectItem value="booking_cancelled">Booking Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="property-message">Custom Message</Label>
                <Textarea
                  id="property-message"
                  value={propertyForm.message}
                  onChange={(e) => setPropertyForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter custom message..."
                />
              </div>
              <Button onClick={handleSendPropertyNotification} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send Property Notification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Notifications Tab */}
        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Admin Notifications
              </CardTitle>
              <CardDescription>
                Send administrative notifications to specific user roles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-role">Target Role</Label>
                  <Select value={adminForm.targetRole} onValueChange={(value) => setAdminForm(prev => ({ ...prev, targetRole: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Users</SelectItem>
                      <SelectItem value="host">Hosts</SelectItem>
                      <SelectItem value="manager">Managers</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-type">Notification Type</Label>
                  <Input
                    id="admin-type"
                    value={adminForm.notificationType}
                    onChange={(e) => setAdminForm(prev => ({ ...prev, notificationType: e.target.value }))}
                    placeholder="e.g., policy_update, maintenance"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-title">Title</Label>
                <Input
                  id="admin-title"
                  value={adminForm.title}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-body">Message</Label>
                <Textarea
                  id="admin-body"
                  value={adminForm.body}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Enter admin message..."
                />
              </div>
              <Button onClick={handleSendAdminNotification} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send Admin Notification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Announcements Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Announcements
              </CardTitle>
              <CardDescription>
                Send system-wide announcements to all users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="system-priority">Priority</Label>
                  <Select value={systemForm.priority} onValueChange={(value: any) => setSystemForm(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Roles</Label>
                  <div className="flex gap-2 flex-wrap">
                    {['user', 'host', 'manager', 'admin'].map(role => (
                      <Badge
                        key={role}
                        variant={systemForm.targetRoles.includes(role) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const newRoles = systemForm.targetRoles.includes(role)
                            ? systemForm.targetRoles.filter(r => r !== role)
                            : [...systemForm.targetRoles, role];
                          setSystemForm(prev => ({ ...prev, targetRoles: newRoles }));
                        }}
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="system-title">Title</Label>
                <Input
                  id="system-title"
                  value={systemForm.title}
                  onChange={(e) => setSystemForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="system-body">Announcement</Label>
                <Textarea
                  id="system-body"
                  value={systemForm.body}
                  onChange={(e) => setSystemForm(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Enter system announcement..."
                />
              </div>
              <Button onClick={handleSendSystemAnnouncement} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send System Announcement
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role-specific Notifications Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Host Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Host Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="host-id">Host ID</Label>
                  <Input
                    id="host-id"
                    value={hostForm.hostId}
                    onChange={(e) => setHostForm(prev => ({ ...prev, hostId: e.target.value }))}
                    placeholder="Host user ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="host-type">Notification Type</Label>
                  <Select value={hostForm.notificationType} onValueChange={(value: any) => setHostForm(prev => ({ ...prev, notificationType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_inquiry">New Inquiry</SelectItem>
                      <SelectItem value="booking_request">Booking Request</SelectItem>
                      <SelectItem value="payment_received">Payment Received</SelectItem>
                      <SelectItem value="review_received">Review Received</SelectItem>
                      <SelectItem value="property_performance">Property Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="host-guest">Guest Name</Label>
                  <Input
                    id="host-guest"
                    value={hostForm.guestName}
                    onChange={(e) => setHostForm(prev => ({ ...prev, guestName: e.target.value }))}
                  />
                </div>
                <Button onClick={handleSendHostNotification} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Host Notification
                </Button>
              </CardContent>
            </Card>

            {/* Manager Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Manager Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manager-id">Manager ID</Label>
                  <Input
                    id="manager-id"
                    value={managerForm.managerId}
                    onChange={(e) => setManagerForm(prev => ({ ...prev, managerId: e.target.value }))}
                    placeholder="Manager user ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager-type">Notification Type</Label>
                  <Select value={managerForm.notificationType} onValueChange={(value: any) => setManagerForm(prev => ({ ...prev, notificationType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="property_assigned">Property Assigned</SelectItem>
                      <SelectItem value="property_removed">Property Removed</SelectItem>
                      <SelectItem value="maintenance_request">Maintenance Request</SelectItem>
                      <SelectItem value="booking_issue">Booking Issue</SelectItem>
                      <SelectItem value="performance_alert">Performance Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager-assigned">Assigned By</Label>
                  <Input
                    id="manager-assigned"
                    value={managerForm.assignedBy}
                    onChange={(e) => setManagerForm(prev => ({ ...prev, assignedBy: e.target.value }))}
                  />
                </div>
                <Button onClick={handleSendManagerNotification} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Manager Notification
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}