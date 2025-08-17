import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
);

// VAPID keys for push notifications (in production, these should be environment variables)
const VAPID_PUBLIC_KEY = 'BKo1_5aDrC5zD3pGgXD0L6dRH1JGgZO_W9KzXBt8EWx2FZs3H8Qm0YWy7qQp9k8NzGJV4';
const VAPID_PRIVATE_KEY = 'OyVt9QZ1kR3fzjXs7qWe6rT5yU8i9oP0a2sDfGhJkLmNpRtYwZcXvBnMqAsDeFlG';

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize mock users on startup
async function initializeMockUsers() {
  try {
    // Check if users already exist
    const existingUsers = await kv.getByPrefix("user:");
    if (existingUsers.length === 0) {
      console.log("Seeding mock users...");
      
      const mockUsers = [
        {
          id: '1',
          name: 'Bob Smith',
          email: 'bob@example.com',
          role: 'user',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        },
        {
          id: '2',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          role: 'host',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
        },
        {
          id: '3',
          name: 'John Davis',
          email: 'john@example.com',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
        },
        {
          id: '4',
          name: 'Sarah Wilson',
          email: 'sarah@example.com',
          role: 'manager',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
        },
        {
          id: '5',
          name: 'Mike Rodriguez',
          email: 'mike@example.com',
          role: 'manager',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face'
        },
        {
          id: '6',
          name: 'Emily Chen',
          email: 'emily@example.com',
          role: 'host',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face'
        }
      ];

      for (const user of mockUsers) {
        await kv.set(`user:${user.id}`, JSON.stringify(user));
      }
      
      // Initialize mock properties with coordinates
      const mockProperties = [
        {
          id: 'prop_1',
          title: 'Modern 3-Bedroom Apartment',
          description: 'Beautiful modern apartment in the heart of Accra with stunning city views.',
          price: 250000,
          location: 'East Legon, Accra',
          coordinates: { lat: 5.6308, lng: -0.1528 },
          images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'],
          type: 'apartment',
          bedrooms: 3,
          bathrooms: 2,
          area: 120,
          size: 120,
          amenities: ['Air Conditioning', 'Swimming Pool', 'Security', 'Parking'],
          ownerId: '2',
          available: true,
          featured: true,
          rating: 4.8,
          reviews: 24,
          views: 156,
          createdAt: new Date().toISOString()
        },
        {
          id: 'prop_2',
          title: 'Luxury Villa with Garden',
          description: 'Spacious luxury villa with beautiful garden and modern amenities in Airport Residential.',
          price: 450000,
          location: 'Airport Residential, Accra',
          coordinates: { lat: 5.6051, lng: -0.1677 },
          images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'],
          type: 'house',
          bedrooms: 4,
          bathrooms: 3,
          area: 200,
          size: 200,
          amenities: ['Garden', 'Garage', 'Security System', 'Modern Kitchen'],
          ownerId: '6',
          available: true,
          featured: true,
          rating: 4.9,
          reviews: 18,
          views: 89,
          createdAt: new Date().toISOString()
        },
        {
          id: 'prop_3',
          title: 'Commercial Plot in Downtown',
          description: 'Prime commercial land in downtown Accra perfect for business development.',
          price: 800000,
          location: 'Downtown, Accra',
          coordinates: { lat: 5.5600, lng: -0.2057 },
          images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop'],
          type: 'land',
          area: 500,
          size: 500,
          amenities: ['Road Access', 'Utilities Available', 'Commercial Zone'],
          ownerId: '2',
          available: true,
          featured: false,
          rating: 4.5,
          reviews: 12,
          views: 234,
          createdAt: new Date().toISOString()
        },
        {
          id: 'prop_4',
          title: 'Cozy 2-Bedroom in Cantonments',
          description: 'Comfortable 2-bedroom apartment in the prestigious Cantonments area.',
          price: 180000,
          location: 'Cantonments, Accra',
          coordinates: { lat: 5.5735, lng: -0.1870 },
          images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'],
          type: 'apartment',
          bedrooms: 2,
          bathrooms: 1,
          area: 80,
          size: 80,
          amenities: ['Balcony', 'Security', 'Backup Generator'],
          ownerId: '6',
          available: true,
          featured: false,
          rating: 4.3,
          reviews: 31,
          views: 78,
          createdAt: new Date().toISOString()
        },
        {
          id: 'prop_5',
          title: 'Beachfront Property in Labadi',
          description: 'Stunning beachfront property with direct beach access and ocean views.',
          price: 650000,
          location: 'Labadi, Accra',
          coordinates: { lat: 5.5525, lng: -0.1659 },
          images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'],
          type: 'house',
          bedrooms: 5,
          bathrooms: 4,
          area: 300,
          size: 300,
          amenities: ['Beach Access', 'Ocean View', 'Private Pool', 'Terrace'],
          ownerId: '2',
          available: true,
          featured: true,
          rating: 4.9,
          reviews: 8,
          views: 298,
          createdAt: new Date().toISOString()
        }
      ];

      for (const property of mockProperties) {
        await kv.set(`property:${property.id}`, JSON.stringify(property));
      }
      
      // Initialize mock booking relationships
      const mockBookingRelationships = [
        {
          id: 'rel_1',
          userId: '1', // Bob
          hostId: '2', // Alice
          propertyId: 'prop_1',
          bookingId: 'book_1',
          establishedAt: new Date().toISOString(),
          status: 'active',
          canChat: true
        },
        {
          id: 'rel_2',
          userId: '1', // Bob
          hostId: '6', // Emily
          propertyId: 'prop_2',
          bookingId: 'book_2',
          establishedAt: new Date().toISOString(),
          status: 'completed',
          canChat: true
        }
      ];

      for (const relationship of mockBookingRelationships) {
        await kv.set(`booking_relationship:${relationship.id}`, JSON.stringify(relationship));
      }
      
      console.log(`Seeded ${mockUsers.length} mock users, ${mockProperties.length} properties, and ${mockBookingRelationships.length} booking relationships`);
    } else {
      console.log(`Found ${existingUsers.length} existing users`);
    }
  } catch (error) {
    console.error("Error initializing mock users:", error);
  }
}

// Initialize on startup
initializeMockUsers();

// Health check endpoint
app.get("/make-server-8669f8c6/health", (c) => {
  return c.json({ status: "ok" });
});

// Authentication endpoints
app.post("/make-server-8669f8c6/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    });

    if (error) {
      console.error("Supabase signup error:", error);
      return c.json({ success: false, error: error.message }, 400);
    }

    const userId = data.user.id;
    const userProfile = {
      id: userId,
      name,
      email,
      role: 'user',
      avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face`,
      joinDate: new Date().toISOString().split('T')[0],
      preferences: {
        theme: 'light',
        notifications: true,
        emailUpdates: true,
        currency: 'USD',
        language: 'en'
      }
    };

    await kv.set(`user:${userId}`, JSON.stringify(userProfile));

    return c.json({ 
      success: true, 
      user: userProfile,
      session: data.session 
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return c.json({ success: false, error: "Failed to create account" }, 500);
  }
});

app.post("/make-server-8669f8c6/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase login error:", error);
      return c.json({ success: false, error: error.message }, 400);
    }

    const userProfile = await kv.get(`user:${data.user.id}`);
    if (!userProfile) {
      return c.json({ success: false, error: "User profile not found" }, 404);
    }

    const user = JSON.parse(userProfile);

    return c.json({ 
      success: true, 
      user,
      session: data.session 
    });
  } catch (error) {
    console.error("Error during login:", error);
    return c.json({ success: false, error: "Failed to sign in" }, 500);
  }
});

// Chat endpoints
app.get("/make-server-8669f8c6/chat/rooms/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const rooms = await kv.getByPrefix(`chat:rooms:${userId}:`);
    
    return c.json({ 
      success: true, 
      rooms: rooms.map(room => JSON.parse(room)) 
    });
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    return c.json({ success: false, error: "Failed to fetch chat rooms" }, 500);
  }
});

app.post("/make-server-8669f8c6/chat/rooms", async (c) => {
  try {
    const { name, type, participants, createdBy, description } = await c.req.json();
    
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const room = {
      id: roomId,
      name,
      type,
      participants,
      messages: [],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      createdBy,
      description: description || null,
      avatar: null
    };

    for (const participantId of participants) {
      await kv.set(`chat:rooms:${participantId}:${roomId}`, JSON.stringify(room));
    }

    return c.json({ success: true, room });
  } catch (error) {
    console.error("Error creating chat room:", error);
    return c.json({ success: false, error: "Failed to create chat room" }, 500);
  }
});

app.get("/make-server-8669f8c6/chat/messages/:roomId", async (c) => {
  try {
    const roomId = c.req.param("roomId");
    const messages = await kv.getByPrefix(`chat:messages:${roomId}:`);
    
    const sortedMessages = messages
      .map(msg => JSON.parse(msg))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return c.json({ success: true, messages: sortedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return c.json({ success: false, error: "Failed to fetch messages" }, 500);
  }
});

app.post("/make-server-8669f8c6/chat/messages", async (c) => {
  try {
    const { roomId, senderId, senderName, senderAvatar, content, type = 'text', fileUrl, thumbnailUrl, fileName, fileSize, mimeType, duration } = await c.req.json();
    
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const message = {
      id: messageId,
      senderId,
      senderName,
      senderAvatar,
      content,
      timestamp: new Date().toISOString(),
      type,
      edited: false,
      ...(fileUrl && { fileUrl }),
      ...(thumbnailUrl && { thumbnailUrl }),
      ...(fileName && { fileName }),
      ...(fileSize && { fileSize }),
      ...(mimeType && { mimeType }),
      ...(duration && { duration })
    };

    await kv.set(`chat:messages:${roomId}:${messageId}`, JSON.stringify(message));

    const allRoomKeys = await kv.getByPrefix(`chat:rooms:`);
    const relevantRooms = [];
    
    for (const roomValue of allRoomKeys) {
      const room = JSON.parse(roomValue);
      if (room.id === roomId) {
        relevantRooms.push(room);
      }
    }

    for (const room of relevantRooms) {
      for (const participantId of room.participants) {
        const updatedRoom = {
          ...room,
          lastMessage: message,
          unreadCount: participantId === senderId ? 0 : room.unreadCount + 1
        };
        await kv.set(`chat:rooms:${participantId}:${roomId}`, JSON.stringify(updatedRoom));
        
        if (participantId !== senderId) {
          const notificationData = {
            message,
            room: {
              id: room.id,
              name: room.name,
              type: room.type
            },
            timestamp: new Date().toISOString()
          };
          
          await kv.set(`chat:notification:${participantId}:${messageId}`, JSON.stringify(notificationData));
        }
      }
    }

    return c.json({ success: true, message });
  } catch (error) {
    console.error("Error sending message:", error);
    return c.json({ success: false, error: "Failed to send message" }, 500);
  }
});

// Properties endpoints
app.get("/make-server-8669f8c6/properties", async (c) => {
  try {
    const properties = await kv.getByPrefix("property:");
    let propertyList = properties.map(prop => JSON.parse(prop));

    propertyList.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.rating - a.rating;
    });

    return c.json({ 
      success: true, 
      properties: propertyList,
      total: propertyList.length 
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return c.json({ success: false, error: "Failed to fetch properties" }, 500);
  }
});

// Users endpoints
app.get("/make-server-8669f8c6/users", async (c) => {
  try {
    const users = await kv.getByPrefix("user:");
    const userList = users.map(user => {
      const userData = JSON.parse(user);
      return {
        id: userData.id,
        name: userData.name,
        role: userData.role,
        avatar: userData.avatar
      };
    });
    
    return c.json({ success: true, users: userList });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ success: false, error: "Failed to fetch users" }, 500);
  }
});

// Push notification endpoints
app.get("/make-server-8669f8c6/push/vapid-key", (c) => {
  return c.json({ 
    success: true, 
    publicKey: VAPID_PUBLIC_KEY 
  });
});

app.post("/make-server-8669f8c6/push/devices", async (c) => {
  try {
    const { userId, subscription, name, type, userAgent } = await c.req.json();
    
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const device = {
      id: deviceId,
      userId,
      name,
      type,
      userAgent,
      subscription,
      lastSeen: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`push_device:${deviceId}`, JSON.stringify(device));
    await kv.set(`user_device:${userId}:${deviceId}`, deviceId);
    
    return c.json({ success: true, device });
  } catch (error) {
    console.error("Error registering push device:", error);
    return c.json({ success: false, error: "Failed to register device" }, 500);
  }
});

app.get("/make-server-8669f8c6/push/devices/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const deviceKeys = await kv.getByPrefix(`user_device:${userId}:`);
    
    const devices = [];
    for (const deviceId of deviceKeys) {
      const deviceData = await kv.get(`push_device:${deviceId}`);
      if (deviceData) {
        devices.push(JSON.parse(deviceData));
      }
    }
    
    return c.json({ success: true, devices });
  } catch (error) {
    console.error("Error fetching push devices:", error);
    return c.json({ success: false, error: "Failed to fetch devices" }, 500);
  }
});

app.post("/make-server-8669f8c6/push/test", async (c) => {
  try {
    const { userId, title, body, icon } = await c.req.json();
    
    console.log(`Would send push notification to user ${userId}: ${title} - ${body}`);
    
    return c.json({ success: true, message: "Test notification sent" });
  } catch (error) {
    console.error("Error sending test notification:", error);
    return c.json({ success: false, error: "Failed to send test notification" }, 500);
  }
});

// Notification endpoints
app.get("/make-server-8669f8c6/notifications/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const limit = parseInt(c.req.query("limit") || "50");
    const unread = c.req.query("unread") === "true";
    const type = c.req.query("type");
    
    const notifications = await kv.getByPrefix(`notification:${userId}:`);
    
    let notificationList = notifications
      .map(notification => JSON.parse(notification))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (unread) {
      notificationList = notificationList.filter(n => !n.read);
    }
    
    if (type) {
      notificationList = notificationList.filter(n => n.type === type);
    }
    
    notificationList = notificationList.slice(0, limit);
    
    return c.json({ success: true, notifications: notificationList });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return c.json({ success: false, error: "Failed to fetch notifications" }, 500);
  }
});

app.put("/make-server-8669f8c6/notifications/:userId/:notificationId/read", async (c) => {
  try {
    const userId = c.req.param("userId");
    const notificationId = c.req.param("notificationId");
    
    const notificationData = await kv.get(`notification:${userId}:${notificationId}`);
    if (notificationData) {
      const notification = JSON.parse(notificationData);
      notification.read = true;
      await kv.set(`notification:${userId}:${notificationId}`, JSON.stringify(notification));
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return c.json({ success: false, error: "Failed to mark notification as read" }, 500);
  }
});

app.put("/make-server-8669f8c6/notifications/:userId/read-all", async (c) => {
  try {
    const userId = c.req.param("userId");
    const notifications = await kv.getByPrefix(`notification:${userId}:`);
    
    let updated = 0;
    for (const notificationValue of notifications) {
      const notification = JSON.parse(notificationValue);
      if (!notification.read) {
        notification.read = true;
        await kv.set(`notification:${userId}:${notification.id}`, JSON.stringify(notification));
        updated++;
      }
    }
    
    return c.json({ success: true, updated });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return c.json({ success: false, error: "Failed to mark all notifications as read" }, 500);
  }
});

app.delete("/make-server-8669f8c6/notifications/:userId/:notificationId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const notificationId = c.req.param("notificationId");
    
    await kv.del(`notification:${userId}:${notificationId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return c.json({ success: false, error: "Failed to delete notification" }, 500);
  }
});

Deno.serve(app.fetch);