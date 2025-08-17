import { User, Property, Transaction, UserPreferences, PropertyFilters, PrivacySettings, UserSubscription } from '../types';

const getDefaultPrivacySettings = (): PrivacySettings => ({
  profileVisibility: 'public',
  showEmail: false,
  showPhone: false,
  allowDataCollection: true,
  allowMarketing: false,
  allowAnalytics: true,
  twoFactorEnabled: false
});

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    joinDate: '2024-01-15',
    preferences: {
      theme: 'light',
      notifications: true,
      emailUpdates: true,
      currency: 'GHS',
      language: 'en',
      privacy: getDefaultPrivacySettings()
    },
    subscription: {
      plan: 'free',
      status: 'active',
      startDate: '2024-01-15',
      autoRenew: false,
      features: ['Browse properties', 'Basic search filters', 'Contact property owners', 'Up to 3 bookings per month']
    }
  },
  {
    id: '2',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'host',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&w=32&h=32&fit=crop&crop=face',
    joinDate: '2023-11-20',
    preferences: {
      theme: 'blue',
      notifications: true,
      emailUpdates: false,
      currency: 'USD',
      language: 'en',
      privacy: getDefaultPrivacySettings()
    },
    subscription: {
      plan: 'premium',
      status: 'active',
      startDate: '2023-11-20',
      endDate: '2024-11-20',
      autoRenew: true,
      features: ['Everything in Basic', 'Early access to new properties', 'Exclusive deals and discounts', 'Property alerts and notifications', 'Virtual property tours', 'Dedicated account manager']
    }
  },
  {
    id: '3',
    name: 'John Davis',
    email: 'john@example.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
    joinDate: '2023-06-10',
    preferences: {
      theme: 'dark',
      notifications: true,
      emailUpdates: true,
      currency: 'USD',
      language: 'en',
      privacy: {
        ...getDefaultPrivacySettings(),
        twoFactorEnabled: true,
        profileVisibility: 'private'
      }
    },
    subscription: {
      plan: 'enterprise',
      status: 'active',
      startDate: '2023-06-10',
      autoRenew: true,
      features: ['Everything in Premium', 'Custom branding', 'API access', 'Advanced analytics', 'Multi-user management', 'SLA guarantee', '24/7 phone support']
    }
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
    joinDate: '2024-02-01',
    assignedProperties: ['1', '3', '5'],
    preferences: {
      theme: 'purple',
      notifications: true,
      emailUpdates: true,
      currency: 'USD',
      language: 'en',
      privacy: {
        ...getDefaultPrivacySettings(),
        twoFactorEnabled: true
      }
    },
    subscription: {
      plan: 'basic',
      status: 'active',
      startDate: '2024-02-01',
      endDate: '2024-12-01',
      autoRenew: true,
      features: ['Everything in Free', 'Advanced search filters', 'Unlimited bookings', 'Priority customer support', 'Booking history export']
    }
  },
  {
    id: '5',
    name: 'Mike Rodriguez',
    email: 'mike@example.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
    joinDate: '2024-01-20',
    assignedProperties: ['2', '4', '6'],
    preferences: {
      theme: 'green',
      notifications: true,
      emailUpdates: true,
      currency: 'USD',
      language: 'en',
      privacy: getDefaultPrivacySettings()
    },
    subscription: {
      plan: 'basic',
      status: 'active',
      startDate: '2024-01-20',
      endDate: '2024-12-20',
      autoRenew: true,
      features: ['Everything in Free', 'Advanced search filters', 'Unlimited bookings', 'Priority customer support', 'Booking history export']
    }
  },
  {
    id: '6',
    name: 'Emily Chen',
    email: 'emily@example.com',
    role: 'host',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face',
    joinDate: '2023-12-05',
    preferences: {
      theme: 'orange',
      notifications: false,
      emailUpdates: true,
      currency: 'USD',
      language: 'en',
      privacy: getDefaultPrivacySettings()
    },
    subscription: {
      plan: 'premium',
      status: 'active',
      startDate: '2023-12-05',
      endDate: '2024-12-05',
      autoRenew: false,
      features: ['Everything in Basic', 'Early access to new properties', 'Exclusive deals and discounts', 'Property alerts and notifications', 'Virtual property tours', 'Dedicated account manager']
    }
  }
];

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Downtown Apartment',
    type: 'house',
    price: 15000, // GHS 15,000 per month
    location: 'Accra Central',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3'
    ],
    description: 'Beautiful modern apartment in the heart of Accra with stunning city views.',
    amenities: ['WiFi', 'Air Conditioning', 'Parking', 'Gym', 'Pool'],
    owner: 'Alice Johnson',
    ownerId: '2',
    available: true,
    featured: true,
    rating: 4.8,
    reviews: 124,
    coordinates: [5.6037, -0.1870],
    assignedManager: '4'
  },
  {
    id: '2',
    title: 'Commercial Shop Space',
    type: 'shop',
    price: 25000, // GHS 25,000 per month
    location: 'Osu Business District',
    area: 800,
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3'
    ],
    description: 'Prime commercial space perfect for retail business in busy Osu area.',
    amenities: ['High Foot Traffic', 'Parking', 'Security', 'Storage'],
    owner: 'Alice Johnson',
    ownerId: '2',
    available: true,
    featured: false,
    rating: 4.5,
    reviews: 67,
    coordinates: [5.5502, -0.1819],
    assignedManager: '5'
  },
  {
    id: '3',
    title: 'Luxury Villa with Pool',
    type: 'house',
    price: 45000, // GHS 45,000 per month
    location: 'East Legon',
    bedrooms: 4,
    bathrooms: 3,
    area: 2800,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3'
    ],
    description: 'Stunning luxury villa with private pool and garden in exclusive East Legon.',
    amenities: ['Pool', 'Garden', 'Garage', 'Security System', 'Smart Home'],
    owner: 'Emily Chen',
    ownerId: '6',
    available: true,
    featured: true,
    rating: 4.9,
    reviews: 89,
    coordinates: [5.6108, -0.1663],
    assignedManager: '4'
  },
  {
    id: '4',
    title: 'Prime Development Land',
    type: 'land',
    price: 850000, // GHS 850,000 for purchase
    location: 'Tema Industrial Area',
    area: 5000,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1574263867128-2b17be5be84e?ixlib=rb-4.0.3'
    ],
    description: 'Excellent development opportunity with approved building permits in Tema.',
    amenities: ['Utilities Available', 'Road Access', 'Building Permits'],
    owner: 'Emily Chen',
    ownerId: '6',
    available: true,
    featured: false,
    rating: 4.2,
    reviews: 23,
    coordinates: [5.6698, -0.0166],
    assignedManager: '5'
  },
  {
    id: '5',
    title: 'Cozy Studio Apartment',
    type: 'house',
    price: 8500, // GHS 8,500 per month
    location: 'Adenta',
    bedrooms: 1,
    bathrooms: 1,
    area: 650,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3'
    ],
    description: 'Perfect studio apartment for young professionals in peaceful Adenta.',
    amenities: ['WiFi', 'Laundry', 'Pet Friendly', 'Near Transit'],
    owner: 'Alice Johnson',
    ownerId: '2',
    available: true,
    featured: false,
    rating: 4.3,
    reviews: 156,
    coordinates: [5.7009, -0.1681],
    assignedManager: '4'
  },
  {
    id: '6',
    title: 'Boutique Retail Space',
    type: 'shop',
    price: 18000, // GHS 18,000 per month
    location: 'Labone',
    area: 600,
    images: [
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1567521464027-f127ff144326?ixlib=rb-4.0.3'
    ],
    description: 'Charming boutique space in trendy Labone with high visibility.',
    amenities: ['Street Parking', 'High Visibility', 'Foot Traffic', 'Creative Community'],
    owner: 'Emily Chen',
    ownerId: '6',
    available: false,
    featured: true,
    rating: 4.6,
    reviews: 94,
    coordinates: [5.5717, -0.1728],
    assignedManager: '5'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    propertyId: '1',
    propertyTitle: 'Modern Downtown Apartment',
    userId: '1',
    userName: 'Bob Smith',
    type: 'rent',
    amount: 2500,
    date: '2024-03-15',
    status: 'completed',
    paymentMethod: 'Card',
    duration: '12 months',
    startDate: '2024-04-01',
    endDate: '2025-03-31'
  },
  {
    id: '2',
    propertyId: '3',
    propertyTitle: 'Luxury Villa with Pool',
    userId: '1',
    userName: 'Bob Smith',
    type: 'rent',
    amount: 5500,
    date: '2024-02-20',
    status: 'completed',
    paymentMethod: 'Mobile Money',
    duration: '6 months',
    startDate: '2024-03-01',
    endDate: '2024-08-31'
  },
  {
    id: '3',
    propertyId: '4',
    propertyTitle: 'Prime Development Land',
    userId: '1',
    userName: 'Bob Smith',
    type: 'buy',
    amount: 150000,
    date: '2024-01-10',
    status: 'completed',
    paymentMethod: 'Card'
  }
];

export const getDefaultFilters = (): PropertyFilters => ({
  type: [],
  priceRange: [0, 1000000], // Updated to GHS 1,000,000 max
  location: [],
  bedrooms: [],
  bathrooms: [],
  areaRange: [0, 10000],
  amenities: [],
  availability: []
});

export const getDefaultUserPreferences = (): UserPreferences => ({
  theme: 'light',
  notifications: true,
  emailUpdates: true,
  currency: 'USD',
  language: 'en',
  privacy: getDefaultPrivacySettings()
});