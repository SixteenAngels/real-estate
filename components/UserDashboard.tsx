import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Home, 
  CreditCard, 
  Calendar, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Star,
  Building2,
  DollarSign
} from 'lucide-react';
import { User, Property } from '../types';

interface UserDashboardProps {
  currentUser: User;
  properties: Property[];
  onPropertySelect: (property: Property) => void;
}

export function UserDashboard({ currentUser, properties, onPropertySelect }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock bookings for now - would come from props in real app
  const mockBookings = [
    {
      id: '1',
      propertyTitle: 'Modern Downtown Apartment',
      propertyImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&w=300',
      type: 'rent',
      amount: 2500,
      startDate: '2024-01-15',
      endDate: '2024-07-15',
      status: 'active' as const,
      duration: '6 months'
    },
    {
      id: '2',
      propertyTitle: 'Luxury Villa with Pool',
      propertyImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&w=300',
      type: 'buy',
      amount: 150000,
      startDate: '2024-02-01',
      status: 'completed' as const,
      duration: 'Purchased'
    }
  ];

  const stats = [
    {
      title: 'Active Bookings',
      value: mockBookings.filter(b => b.status === 'active').length.toString(),
      icon: Home,
      color: 'text-blue-600'
    },
    {
      title: 'Total Spent',
      value: `GHS ${mockBookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Properties Viewed',
      value: '24',
      icon: Building2,
      color: 'text-purple-600'
    },
    {
      title: 'Member Since',
      value: currentUser.joinDate ? new Date(currentUser.joinDate).getFullYear().toString() : '2024',
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  const recentBookings = mockBookings.slice(0, 3);
  const favoriteProperties = properties.filter(p => p.featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {currentUser.name}!</h1>
              <p className="text-muted-foreground">Here's what's happening with your properties</p>
            </div>
            <Badge variant="outline" className="text-sm">
              {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
            </Badge>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Your latest property bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentBookings.length > 0 ? (
                    <div className="space-y-4">
                      {recentBookings.map((booking, index) => (
                        <motion.div
                          key={booking.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center space-x-4">
                            <img
                              src={booking.propertyImage}
                              alt={booking.propertyTitle}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <h4 className="font-medium">{booking.propertyTitle}</h4>
                              <p className="text-sm text-muted-foreground">
                                {booking.type.charAt(0).toUpperCase() + booking.type.slice(1)} • 
                                {booking.startDate}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">GHS {booking.amount.toLocaleString()}</p>
                            <Badge 
                              variant={booking.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {booking.status}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No bookings yet</h3>
                      <p className="text-muted-foreground mb-4">Start exploring properties to make your first booking</p>
                      <Button onClick={() => favoriteProperties.length > 0 && onPropertySelect(favoriteProperties[0])}>
                        Browse Properties
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Featured Properties */}
              <Card>
                <CardHeader>
                  <CardTitle>Featured Properties</CardTitle>
                  <CardDescription>Handpicked properties you might like</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {favoriteProperties.map((property, index) => (
                      <motion.div
                        key={property.id}
                        className="cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onPropertySelect(property)}
                      >
                        <Card>
                          <CardContent className="p-4">
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                            <h4 className="font-medium line-clamp-1">{property.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-1">{property.location}</p>
                            <p className="font-semibold mt-2">GHS {property.price.toLocaleString()}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Bookings</CardTitle>
                  <CardDescription>Complete history of your property bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  {mockBookings.length > 0 ? (
                    <div className="space-y-4">
                      {mockBookings.map((booking, index) => (
                        <motion.div
                          key={booking.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex items-center space-x-4">
                            <img
                              src={booking.propertyImage}
                              alt={booking.propertyTitle}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div>
                              <h4 className="font-medium">{booking.propertyTitle}</h4>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Calendar className="h-4 w-4 mr-1" />
                                {booking.startDate} {booking.endDate && `- ${booking.endDate}`}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Clock className="h-4 w-4 mr-1" />
                                {booking.duration || 'Ongoing'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">GHS {booking.amount.toLocaleString()}</p>
                            <Badge 
                              variant={
                                booking.status === 'active' ? 'default' : 
                                booking.status === 'completed' ? 'secondary' : 'destructive'
                              }
                              className="text-xs mt-1"
                            >
                              {booking.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {booking.type.charAt(0).toUpperCase() + booking.type.slice(1)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-medium">No bookings found</h3>
                      <p className="text-muted-foreground mb-6">You haven't made any bookings yet</p>
                      <Button onClick={() => favoriteProperties.length > 0 && onPropertySelect(favoriteProperties[0])}>
                        Start Browsing Properties
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest actions on PropertyHub</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'Viewed property details', property: 'Modern Downtown Apartment', time: '2 hours ago' },
                      { action: 'Updated profile settings', property: null, time: '1 day ago' },
                      { action: 'Made a booking', property: 'Luxury Villa with Pool', time: '3 days ago' },
                      { action: 'Searched for properties', property: 'Downtown area', time: '1 week ago' }
                    ].map((activity, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          {activity.property && (
                            <p className="text-sm text-muted-foreground">{activity.property}</p>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

export default UserDashboard;