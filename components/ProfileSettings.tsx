import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { NotificationSettings, usePushNotifications } from './PushNotificationService';
import { useTheme } from './ThemeProvider';
import { toast } from 'sonner@2.0.3';
import { 
  User as UserIcon, 
  Settings, 
  Bell, 
  Shield, 
  Globe, 
  CreditCard, 
  Eye,
  Camera,
  Save,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Palette,
  Sun,
  Moon
} from 'lucide-react';

interface ProfileSettingsProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
}

export function ProfileSettings({ currentUser, onUpdateUser }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    location: currentUser?.location || '',
    bio: currentUser?.bio || '',
    avatar: currentUser?.avatar || ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: currentUser?.preferences?.notifications ?? true,
    pushNotifications: currentUser?.preferences?.notifications ?? true,
    chatNotifications: currentUser?.preferences?.notifications ?? true,
    marketingEmails: currentUser?.preferences?.emailUpdates ?? false,
    propertyAlerts: currentUser?.preferences?.notifications ?? true,
    theme: currentUser?.preferences?.theme || 'light'
  });

  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const { theme, setTheme } = useTheme();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (field: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (currentUser) {
        const updates = {
          ...formData,
          preferences: {
            ...currentUser.preferences,
            notifications: preferences.emailNotifications,
            emailUpdates: preferences.marketingEmails,
            theme: preferences.theme as any
          }
        };
        
        onUpdateUser(updates);
      }
      toast.success('Profile updated successfully!');
      
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = () => {
    // In a real app, this would open file picker
    const avatarUrls = [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108755-2616b612b4d5?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face'
    ];
    
    const randomAvatar = avatarUrls[Math.floor(Math.random() * avatarUrls.length)];
    setFormData(prev => ({ ...prev, avatar: randomAvatar }));
    setShowAvatarDialog(false);
    toast.success('Avatar updated!');
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Password changed successfully!');
      setShowPasswordChange(false);
      setPasswordData({ current: '', new: '', confirm: '' });
      
    } catch (error) {
      toast.error('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion is not available in demo mode');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center space-x-2">
            <UserIcon className="w-6 h-6" />
            <h1 className="text-3xl font-bold">Profile Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account settings, preferences, and privacy options
          </p>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="text-xs sm:text-sm">Profile</TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifications</TabsTrigger>
              <TabsTrigger value="privacy" className="text-xs sm:text-sm">Privacy</TabsTrigger>
              <TabsTrigger value="appearance" className="text-xs sm:text-sm">Appearance</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              {/* Profile Picture */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={formData.avatar} alt={formData.name} />
                        <AvatarFallback className="text-lg">
                          {formData.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                        onClick={() => setShowAvatarDialog(true)}
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{formData.name}</p>
                      <p className="text-sm text-muted-foreground">{formData.email}</p>
                      <Badge variant="outline" className="mt-1">
                        {currentUser?.role}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              {/* Push Notifications */}
              <NotificationSettings />
              
              {/* Email Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>Email Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-muted-foreground">Receive property recommendations and updates</p>
                      </div>
                      <Switch
                        checked={preferences.marketingEmails}
                        onCheckedChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Property Alerts</p>
                        <p className="text-sm text-muted-foreground">Get notified about new properties matching your criteria</p>
                      </div>
                      <Switch
                        checked={preferences.propertyAlerts}
                        onCheckedChange={(checked) => handlePreferenceChange('propertyAlerts', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Chat Notifications</p>
                        <p className="text-sm text-muted-foreground">Get email notifications for chat messages</p>
                      </div>
                      <Switch
                        checked={preferences.chatNotifications}
                        onCheckedChange={(checked) => handlePreferenceChange('chatNotifications', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Privacy & Data</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Profile Visibility</p>
                        <p className="text-sm text-muted-foreground">Who can see your profile information</p>
                      </div>
                      <Select defaultValue="public">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="contacts">Contacts Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Palette className="w-5 h-5" />
                    <span>Appearance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium mb-3">Theme</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {['light', 'dark', 'blue', 'green', 'purple', 'orange'].map((themeOption) => (
                          <Button
                            key={themeOption}
                            variant={theme === themeOption ? "default" : "outline"}
                            onClick={() => setTheme(themeOption as any)}
                            className="flex items-center space-x-2 capitalize"
                          >
                            {themeOption === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                            <span>{themeOption}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Action Buttons */}
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={isLoading}>
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </Tabs>

          {/* Avatar Selection Dialog */}
          <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Choose Avatar</DialogTitle>
                <DialogDescription>
                  Select a new profile picture
                </DialogDescription>
              </DialogHeader>
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click to generate a random avatar
                </p>
                <Button onClick={handleAvatarUpload} className="w-full">
                  <Camera className="w-4 h-4 mr-2" />
                  Generate Random Avatar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  );
}