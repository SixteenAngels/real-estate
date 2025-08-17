import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Home, Plus, Edit, Trash2, Eye, DollarSign, Calendar, Users, TrendingUp } from 'lucide-react';
import { Property, User as UserType } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from './ui/sonner';

interface PropertyManagementProps {
  user: UserType;
  properties: Property[];
  onAddProperty?: (property: Property) => void;
  onUpdateProperty?: (propertyId: string, updates: any) => void;
  onDeleteProperty?: (propertyId: string) => void;
}

export function PropertyManagement({ 
  user, 
  properties, 
  onAddProperty, 
  onUpdateProperty, 
  onDeleteProperty 
}: PropertyManagementProps) {
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [newProperty, setNewProperty] = useState({
    title: '',
    type: 'house' as 'house' | 'land' | 'shop',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    description: '',
    amenities: [] as string[],
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3']
  });

  // Filter properties based on user role
  const userProperties = properties.filter(p => {
    if (user.role === 'admin') return true;
    if (user.role === 'manager') return user.assignedProperties?.includes(p.id);
    if (user.role === 'host') return p.ownerId === user.id;
    return false;
  });

  const stats = {
    totalProperties: userProperties.length,
    availableProperties: userProperties.filter(p => p.available).length,
    totalValue: userProperties.reduce((sum, p) => sum + (p.price || 0), 0),
    averageRating: userProperties.length > 0 
      ? userProperties.reduce((sum, p) => sum + (p.rating || 0), 0) / userProperties.length
      : 0
  };

  const handleAddProperty = () => {
    if (!onAddProperty) return;

    const property: Property = {
      id: Date.now().toString(),
      title: newProperty.title,
      type: newProperty.type,
      price: parseInt(newProperty.price) || 0,
      location: newProperty.location,
      bedrooms: newProperty.bedrooms ? parseInt(newProperty.bedrooms) : undefined,
      bathrooms: newProperty.bathrooms ? parseInt(newProperty.bathrooms) : undefined,
      area: parseInt(newProperty.area) || 0,
      images: newProperty.images,
      description: newProperty.description,
      amenities: newProperty.amenities,
      owner: user.name,
      ownerId: user.id,
      available: true,
      featured: false,
      rating: 0,
      reviews: 0,
      coordinates: [40.7128, -74.0060]
    };

    onAddProperty(property);
    setIsAddingProperty(false);
    setNewProperty({
      title: '',
      type: 'house',
      price: '',
      location: '',
      bedrooms: '',
      bathrooms: '',
      area: '',
      description: '',
      amenities: [],
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3']
    });
  };

  const handleUpdateProperty = (updates: any) => {
    if (!editingProperty || !onUpdateProperty) return;
    onUpdateProperty(editingProperty.id, updates);
    setEditingProperty(null);
  };

  const getTitle = () => {
    switch (user.role) {
      case 'admin':
        return '🏢 Property Management';
      case 'manager':
        return '📊 Assigned Properties';
      case 'host':
        return '🏡 My Properties';
      default:
        return '🏠 Properties';
    }
  };

  const getDescription = () => {
    switch (user.role) {
      case 'admin':
        return 'Manage all platform properties and assignments';
      case 'manager':
        return 'Manage properties assigned to you';
      case 'host':
        return 'Manage your property listings';
      default:
        return 'View properties';
    }
  };

  return (
    <div className="py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1>{getTitle()}</h1>
        <p className="text-muted-foreground">{getDescription()}</p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">Properties managed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Available</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableProperties}</div>
            <p className="text-xs text-muted-foreground">Ready for booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Portfolio value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Avg. Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="properties" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          {(user.role === 'host' || user.role === 'admin') && onAddProperty && (
            <Dialog open={isAddingProperty} onOpenChange={setIsAddingProperty}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Property</DialogTitle>
                  <DialogDescription>Create a new property listing</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Property Title</Label>
                    <Input
                      id="title"
                      value={newProperty.title}
                      onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })}
                      placeholder="Modern Downtown Apartment"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Property Type</Label>
                    <Select
                      value={newProperty.type}
                      onValueChange={(value: any) => setNewProperty({ ...newProperty, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">House/Apartment</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                        <SelectItem value="shop">Commercial/Shop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProperty.price}
                      onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })}
                      placeholder="2500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newProperty.location}
                      onChange={(e) => setNewProperty({ ...newProperty, location: e.target.value })}
                      placeholder="Downtown, New York"
                    />
                  </div>
                  {newProperty.type === 'house' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          value={newProperty.bedrooms}
                          onChange={(e) => setNewProperty({ ...newProperty, bedrooms: e.target.value })}
                          placeholder="2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          value={newProperty.bathrooms}
                          onChange={(e) => setNewProperty({ ...newProperty, bathrooms: e.target.value })}
                          placeholder="2"
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="area">Area (sq ft)</Label>
                    <Input
                      id="area"
                      type="number"
                      value={newProperty.area}
                      onChange={(e) => setNewProperty({ ...newProperty, area: e.target.value })}
                      placeholder="1200"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProperty.description}
                      onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                      placeholder="Beautiful property with amazing views..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingProperty(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddProperty}>
                    Add Property
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <TabsContent value="properties" className="space-y-6">
          <motion.div
            className="grid gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {userProperties.length > 0 ? (
              userProperties.map((property) => (
                <Card key={property.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <ImageWithFallback
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full lg:w-48 h-48 lg:h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{property.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <span>{property.location}</span>
                              <span>${property.price.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant={property.available ? 'default' : 'secondary'}>
                              {property.available ? 'Available' : 'Unavailable'}
                            </Badge>
                            <Badge variant="outline">{property.type}</Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {property.description}
                        </p>

                        <div className="flex justify-between items-center pt-2">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>⭐ {property.rating.toFixed(1)}</span>
                            <span>({property.reviews} reviews)</span>
                            <span>{property.area} sq ft</span>
                          </div>
                          <div className="flex space-x-2">
                            {onUpdateProperty && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingProperty(property)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Property</DialogTitle>
                                    <DialogDescription>Update property information</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Availability</Label>
                                      <Select
                                        defaultValue={property.available ? 'available' : 'unavailable'}
                                        onValueChange={(value) => 
                                          handleUpdateProperty({ available: value === 'available' })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="available">Available</SelectItem>
                                          <SelectItem value="unavailable">Unavailable</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                            {onDeleteProperty && user.role === 'admin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this property?')) {
                                    onDeleteProperty(property.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No Properties Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {user.role === 'host' 
                      ? "You haven't added any properties yet" 
                      : "No properties assigned to you"}
                  </p>
                  {(user.role === 'host' || user.role === 'admin') && onAddProperty && (
                    <Button onClick={() => setIsAddingProperty(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Property
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Analytics</CardTitle>
              <CardDescription>Performance metrics for your properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                <p>Analytics features coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}