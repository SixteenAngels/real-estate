import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { ThemeSelector } from './ThemeSelector';
import { 
  Search, 
  Plus, 
  LogIn, 
  LogOut, 
  Settings, 
  User, 
  Moon, 
  Sun, 
  Menu,
  Home,
  MessageCircle,
  Bell,
  Palette,
  Shield,
  CreditCard,
  HelpCircle,
  Grid3x3,
  PieChart,
  Building2
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { User as UserType, AppView } from '../types';

interface HeaderProps {
  currentUser: UserType | null;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  notificationCount: number;
}

export function Header({ 
  currentUser, 
  currentView,
  onNavigate,
  onLogout, 
  notificationCount
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { theme } = useTheme();

  const navigationItems = [
    { id: 'marketplace', label: 'Marketplace', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: Grid3x3 },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    ...(currentUser?.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'help', label: 'Help', icon: HelpCircle }
  ];

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
              <AvatarFallback>
                {currentUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser?.email}
            </p>
            <Badge variant="outline" className="w-fit text-xs mt-1">
              {currentUser?.role}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onNavigate('dashboard')}>
          <User className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onNavigate('chat')}>
          <MessageCircle className="mr-2 h-4 w-4" />
          <span>Chat</span>
          {notificationCount > 0 && (
            <Badge variant="destructive" className="ml-auto text-xs">
              {notificationCount}
            </Badge>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onNavigate('billing')}>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Billing</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onNavigate('help')}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <motion.header 
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Enhanced Logo with 3D Effect */}
            <motion.div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => onNavigate('marketplace')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="relative"
                whileHover={{ rotateY: 15, rotateX: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="h-10 w-10 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <motion.div
                    animate={{ rotateY: [0, 10, 0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Building2 className="h-5 w-5 text-primary-foreground" />
                  </motion.div>
                </div>
                {/* Floating dot */}
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-green-400 to-blue-500 rounded-full"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="hidden sm:block font-bold text-xl bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                  PropertyHub
                </span>
              </motion.div>
            </motion.div>

            {/* Desktop Navigation */}
            {currentUser && (
              <nav className="hidden lg:flex items-center space-x-1">
                {navigationItems.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={currentView === item.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => onNavigate(item.id as AppView)}
                      className={`flex items-center space-x-2 transition-all duration-300 relative ${
                        currentView === item.id 
                          ? 'shadow-lg bg-gradient-to-r from-primary to-primary/90' 
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {/* Add notification badge for chat */}
                      {item.id === 'chat' && notificationCount > 0 && (
                        <motion.span
                          className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {notificationCount}
                        </motion.span>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </nav>
            )}

            {/* Enhanced Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <motion.div 
                className="relative w-full"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search properties, locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 bg-background/80 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-300"
                  />
                </div>
              </motion.div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {currentUser ? (
                <>
                  {/* Chat Button - Prominent placement */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant={currentView === 'chat' ? "default" : "ghost"} 
                      size="sm" 
                      className="relative"
                      onClick={() => onNavigate('chat')}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {notificationCount > 0 && (
                        <motion.span
                          className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {notificationCount}
                        </motion.span>
                      )}
                    </Button>
                  </motion.div>

                  {/* Notifications */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="h-4 w-4" />
                      {notificationCount > 0 && (
                        <motion.span
                          className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {notificationCount}
                        </motion.span>
                      )}
                    </Button>
                  </motion.div>
                  
                  {/* Theme Selector */}
                  <ThemeSelector />
                  
                  {/* User Menu */}
                  <UserMenu />
                </>
              ) : (
                <>
                  <ThemeSelector />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" size="sm">
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center space-x-2">
              {currentUser && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </Button>
                </motion.div>
              )}
              
              <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                <SheetTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col h-full">
                    {/* Mobile Header */}
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        PropertyHub
                      </span>
                    </div>

                    {/* Mobile Search */}
                    <div className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search properties..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4"
                        />
                      </div>
                    </div>

                    {currentUser ? (
                      <>
                        {/* User Info */}
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 mb-6">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                            <AvatarFallback>
                              {currentUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{currentUser?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {currentUser?.role}
                            </Badge>
                          </div>
                        </div>

                        {/* Mobile Navigation Items */}
                        <div className="space-y-2 flex-1">
                          {navigationItems.map((item) => (
                            <Button
                              key={item.id}
                              variant={currentView === item.id ? "default" : "ghost"}
                              className="w-full justify-start"
                              onClick={() => {
                                onNavigate(item.id as AppView);
                                setShowMobileMenu(false);
                              }}
                            >
                              <item.icon className="mr-3 h-4 w-4" />
                              {item.label}
                            </Button>
                          ))}
                        </div>

                        {/* Theme Selector */}
                        <div className="border-t pt-4 mb-4">
                          <p className="text-sm font-medium mb-3">Theme</p>
                          <ThemeSelector />
                        </div>

                        {/* Logout Button */}
                        <Button
                          variant="outline"
                          className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => {
                            onLogout();
                            setShowMobileMenu(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2 flex-1">
                          <Button
                            className="w-full"
                            onClick={() => {
                              setShowMobileMenu(false);
                            }}
                          >
                            <LogIn className="mr-2 h-4 w-4" />
                            Login
                          </Button>
                        </div>
                        
                        {/* Theme Selector */}
                        <div className="border-t pt-4">
                          <p className="text-sm font-medium mb-3">Theme</p>
                          <ThemeSelector />
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>
    </>
  );
}