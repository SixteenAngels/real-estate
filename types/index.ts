export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'host' | 'manager' | 'admin';
  avatar?: string;
  phone?: string;
  createdAt?: string;
  joinDate?: string;
  assignedProperties?: string[];
  preferences?: UserPreferences;
  subscription?: UserSubscription;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange';
  notifications: boolean;
  emailUpdates: boolean;
  currency: string;
  language: string;
  privacy: PrivacySettings;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  allowDataCollection: boolean;
  allowMarketing: boolean;
  allowAnalytics: boolean;
  twoFactorEnabled: boolean;
}

export interface UserSubscription {
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'expired';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  features: string[];
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  coordinates?: { lat: number; lng: number };
  images: string[];
  type: 'house' | 'apartment' | 'land' | 'shop' | 'commercial';
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  size?: number;
  amenities: string[];
  owner?: string;
  ownerId: string;
  available: boolean;
  featured?: boolean;
  rating: number;
  reviews: number;
  views?: number;
  createdAt?: string;
  assignedManager?: string;
  
  // Enhanced search features
  highlightedTitle?: string;
  highlightedLocation?: string;
  descriptionSnippet?: string;
  relevanceScore?: number;
}

export interface PropertyFilters {
  search?: string;
  type: string[];
  priceRange: [number, number];
  location: string[];
  bedrooms: string[];
  bathrooms: string[];
  areaRange: [number, number];
  amenities: string[];
  availability: string[];
}

export interface Transaction {
  id: string;
  propertyId: string;
  propertyTitle: string;
  userId: string;
  userName: string;
  type: 'rent' | 'buy' | 'lease';
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: 'Card' | 'Mobile Money' | 'Bank Transfer';
  duration?: string;
  startDate?: string;
  endDate?: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  userId: string;
  hostId: string;
  type: 'rent' | 'buy' | 'lease';
  startDate: string;
  endDate: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  paymentReference: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
  type: 'direct' | 'group';
  title?: string;
}

// Enhanced Chat System Types
export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
  editedAt?: string;
  replyTo?: string;
  reactions?: MessageReaction[];
  mentions?: string[];
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  propertyId?: string;
  propertyTitle?: string;
  bookingId?: string;
  systemMessage?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: 'support' | 'booking' | 'property' | 'general';
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: 'direct' | 'group' | 'property' | 'support';
  participants: string[];
  createdBy: string;
  createdAt: string;
  lastActivity: string;
  isActive: boolean;
  metadata?: ChatRoomMetadata;
  lastMessage?: ChatMessage;
  unreadCount?: number;
  avatar?: string;
}

export interface ChatRoomMetadata {
  propertyId?: string;
  propertyTitle?: string;
  supportTicketId?: string;
  isArchived?: boolean;
  permissions?: ChatPermissions;
}

export interface ChatPermissions {
  canDeleteMessages: boolean;
  canEditMessages: boolean;
  canInviteUsers: boolean;
  canRemoveUsers: boolean;
  canPinMessages: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'chat' | 'booking' | 'property' | 'system';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  metadata?: NotificationMetadata;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: 'message' | 'booking' | 'property' | 'system' | 'payment';
}

export interface NotificationMetadata {
  roomId?: string;
  propertyId?: string;
  bookingId?: string;
  senderId?: string;
  senderName?: string;
  actionType?: 'view' | 'approve' | 'decline' | 'respond';
  expiresAt?: string;
}

export type AppState = 'splash' | 'auth-landing' | 'login' | 'signup' | 'main';

// Enhanced App State type
export type ExtendedAppState = AppState | 'dashboard' | 'profile' | 'admin' | 'analytics' | 'chat' | 'mobile' | 'payments' | 'notifications' | 'map' | 'directions' | 'tour-scheduler' | 'offline-maps';

// Mobile App types
export type MobileAppView = 'marketplace' | 'search' | 'favorites' | 'bookings' | 'profile';

export interface PWAInstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

// WebSocket Types
export interface WebSocketMessage {
  id: string;
  type: WebSocketMessageType;
  payload: WebSocketPayload;
  timestamp: string;
  userId?: string;
  priority?: 'low' | 'normal' | 'high';
  retryCount?: number;
}

export type WebSocketMessageType = 
  | 'connection.established'
  | 'connection.lost'
  | 'heartbeat'
  | 'message.acknowledged'
  | 'notification.new'
  | 'property.updated'
  | 'booking.status_changed'
  | 'chat.message_received'
  | 'chat.typing_start'
  | 'chat.typing_stop'
  | 'user.status_changed';

export interface WebSocketPayload {
  message?: ChatMessage;
  notification?: Notification;
  property?: Property;
  booking?: Booking;
  user?: User;
  room?: ChatRoom;
  status?: string;
  error?: ErrorDetails;
  data?: Record<string, unknown>;
}

// Error Types
export interface ErrorDetails {
  code: string;
  message: string;
  context?: ErrorContext;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: ErrorCategory;
  stack?: string;
  userAgent?: string;
  url?: string;
}

export type ErrorCategory = 
  | 'authentication'
  | 'authorization'
  | 'network'
  | 'validation'
  | 'database'
  | 'websocket'
  | 'payment'
  | 'file_upload'
  | 'geolocation'
  | 'pwa'
  | 'unknown';

export interface ErrorContext {
  component?: string;
  function?: string;
  propertyId?: string;
  userId?: string;
  chatRoomId?: string;
  bookingId?: string;
  requestId?: string;
  additionalData?: Record<string, unknown>;
}

// Analytics Types
export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: string;
  userId?: string;
  sessionId: string;
  data: AnalyticsEventData;
  metadata?: AnalyticsMetadata;
}

export type AnalyticsEventType = 
  | 'page_view'
  | 'property_view'
  | 'property_search'
  | 'property_filter'
  | 'property_favorite'
  | 'booking_initiated'
  | 'booking_completed'
  | 'chat_message_sent'
  | 'user_login'
  | 'user_logout'
  | 'error_occurred';

export interface AnalyticsEventData {
  page?: string;
  propertyId?: string;
  searchQuery?: string;
  filters?: Partial<PropertyFilters>;
  bookingId?: string;
  error?: ErrorDetails;
  duration?: number;
  value?: number;
  customProperties?: Record<string, unknown>;
}

export interface AnalyticsMetadata {
  source: string;
  medium: string;
  campaign?: string;
  userAgent: string;
  viewport: { width: number; height: number };
  referrer?: string;
  location: LocationData;
}

// Form Validation Types
export interface ValidationRule<T = unknown> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => boolean | string;
  message?: string;
}

export interface FormFieldError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormFieldError[];
  warnings?: FormFieldError[];
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ErrorDetails;
  message?: string;
  pagination?: PaginationInfo;
  metadata?: ResponseMetadata;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ResponseMetadata {
  requestId: string;
  timestamp: string;
  version: string;
  executionTime: number;
  cached?: boolean;
  cacheExpiry?: string;
}