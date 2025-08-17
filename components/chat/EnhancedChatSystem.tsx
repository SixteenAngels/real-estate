import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Search, 
  Plus, 
  Users, 
  MessageSquare, 
  Paperclip,
  Smile,
  Mic,
  Image as ImageIcon,
  FileText,
  Calendar,
  MapPin,
  Star,
  Settings,
  Bell,
  Archive,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../auth/AuthProvider';
import { useMobile } from '../../hooks/useMobile';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import MobileChatSystem from './MobileChatSystem';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'system';
  edited?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'support';
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  avatar?: string;
  description?: string;
}

interface EnhancedChatSystemProps {
  className?: string;
  height?: string;
}

export function EnhancedChatSystem({ className = '', height = '600px' }: EnhancedChatSystemProps) {
  const isMobile = useMobile();
  
  // Return appropriate component based on device type
  if (isMobile) {
    return <MobileChatSystem className={className} height={height} />;
  }
  
  return <DesktopChatSystem className={className} height={height} />;
}

function DesktopChatSystem({ className = '', height = '600px' }: EnhancedChatSystemProps) {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load chat rooms and available users on mount
  useEffect(() => {
    if (user) {
      loadChatRooms();
      loadAvailableUsers();
      
      // Simulate online users (in real app, use WebSocket)
      const interval = setInterval(() => {
        const randomUsers = availableUsers
          .filter(() => Math.random() > 0.7)
          .map(u => u.id);
        setOnlineUsers(new Set(randomUsers));
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [user, availableUsers.length]);

  // Load messages when room changes
  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
      markRoomAsRead(selectedRoom.id);
    }
  }, [selectedRoom]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatRooms = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8669f8c6/chat/rooms/${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRooms(data.rooms);
        }
      }
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
      // Don't show error toast for network issues in preview environment
    }
  };

  const loadAvailableUsers = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8669f8c6/users/${user.id}/chat-eligible`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailableUsers(data.users);
        }
      }
    } catch (error) {
      console.error('Failed to load available users:', error);
      // Don't show error toast for network issues in preview environment
    }
  };

  const loadMessages = async (roomId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8669f8c6/chat/messages/${roomId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(data.messages);
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      // Only show error for non-network issues
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        console.warn('Network error in preview environment - this is expected');
      } else {
        toast.error('Failed to load messages');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !user) return;

    const messageData = {
      roomId: selectedRoom.id,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      content: newMessage.trim(),
      type: 'text'
    };

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8669f8c6/chat/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageData)
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(prev => [...prev, data.message]);
          setNewMessage('');
          loadChatRooms(); // Refresh rooms to update last message
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Only show error for non-network issues
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        console.warn('Network error in preview environment - this is expected');
      } else {
        toast.error('Failed to send message');
      }
    }
  };

  const markRoomAsRead = async (roomId: string) => {
    if (!user) return;

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8669f8c6/chat/rooms/${roomId}/read/${user.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.warn('Failed to mark room as read:', error);
    }
  };

  const createDirectMessage = async (targetUserId: string) => {
    if (!user) return;

    const targetUser = availableUsers.find(u => u.id === targetUserId);
    if (!targetUser) return;

    const roomData = {
      name: `${user.name} & ${targetUser.name}`,
      type: 'direct',
      participants: [user.id, targetUserId],
      createdBy: user.id
    };

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8669f8c6/chat/rooms`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(roomData)
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await loadChatRooms();
          setSelectedRoom(data.room);
          setShowCreateRoom(false);
          toast.success(`Started chat with ${targetUser.name}`);
        }
      }
    } catch (error) {
      console.error('Failed to create direct message:', error);
      toast.error('Failed to start chat');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, you would upload the file to storage and send the URL
    toast.info('File upload functionality would be implemented here');
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = availableUsers.filter(availableUser =>
    availableUser.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    availableUser.id !== user?.id
  );

  return (
    <div className={`flex ${className}`} style={{ height }}>
      {/* Sidebar - Chat List */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Messages</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowCreateRoom(!showCreateRoom)}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Create Room Panel */}
        <AnimatePresence>
          {showCreateRoom && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-border overflow-hidden"
            >
              <div className="p-4">
                <h3 className="font-medium mb-3">Start a conversation</h3>
                <ScrollArea className="max-h-48">
                  {filteredUsers.map(availableUser => (
                    <div
                      key={availableUser.id}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                      onClick={() => createDirectMessage(availableUser.id)}
                    >
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={availableUser.avatar} />
                          <AvatarFallback>{availableUser.name[0]}</AvatarFallback>
                        </Avatar>
                        {onlineUsers.has(availableUser.id) && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{availableUser.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{availableUser.role}</div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rooms List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredRooms.map(room => (
              <motion.div
                key={room.id}
                className={`flex items-center gap-3 p-3 hover:bg-muted rounded-lg cursor-pointer mb-1 ${
                  selectedRoom?.id === room.id ? 'bg-muted' : ''
                }`}
                onClick={() => setSelectedRoom(room)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={room.avatar} />
                    <AvatarFallback>{room.name[0]}</AvatarFallback>
                  </Avatar>
                  {room.type === 'group' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <Users className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">{room.name}</h4>
                    {room.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatMessageTime(room.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  
                  {room.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {room.lastMessage.type === 'text' 
                        ? room.lastMessage.content 
                        : `📎 ${room.lastMessage.fileName || 'File'}`
                      }
                    </p>
                  )}
                </div>

                {room.unreadCount > 0 && (
                  <Badge variant="destructive" className="w-5 h-5 flex items-center justify-center p-0 text-xs">
                    {room.unreadCount}
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedRoom.avatar} />
                    <AvatarFallback>{selectedRoom.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedRoom.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedRoom.type === 'direct' ? 'Direct message' : 
                       selectedRoom.type === 'group' ? `${selectedRoom.participants.length} members` :
                       'Support chat'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => {
                    const isOwn = message.senderId === user?.id;
                    const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.senderId !== message.senderId);
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwn && (
                          <div className="w-8">
                            {showAvatar && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={message.senderAvatar} />
                                <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )}
                        
                        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : ''}`}>
                          {!isOwn && showAvatar && (
                            <div className="text-xs text-muted-foreground mb-1">
                              {message.senderName}
                            </div>
                          )}
                          
                          <div className={`rounded-lg p-3 ${
                            isOwn 
                              ? 'bg-primary text-primary-foreground ml-auto' 
                              : 'bg-muted'
                          }`}>
                            {message.type === 'text' && (
                              <p className="text-sm">{message.content}</p>
                            )}
                            
                            {message.type === 'image' && (
                              <div>
                                <img
                                  src={message.fileUrl}
                                  alt="Shared image"
                                  className="max-w-full rounded mb-2"
                                />
                                {message.content && (
                                  <p className="text-sm">{message.content}</p>
                                )}
                              </div>
                            )}
                            
                            {message.type === 'file' && (
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{message.fileName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {message.fileSize && `${(message.fileSize / 1024).toFixed(1)} KB`}
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            <div className={`flex items-center justify-between mt-2 text-xs ${
                              isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              <span>{formatMessageTime(message.timestamp)}</span>
                              {message.edited && <span>edited</span>}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {isLoading && (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Input
                    ref={messageInputRef}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="resize-none"
                  />
                </div>
                
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No conversation selected</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedChatSystem;