import React from 'react';
import { motion } from 'motion/react';
import { User as UserType } from '../types';
import { useMobile } from '../hooks/useMobile';
import { NotificationBadge } from './NotificationCenter';

interface UserData {
  currentUser: UserType | null;
  userInitials: string;
  isAdminOrManager: boolean;
}

interface AppHeaderProps {
  currentUser: UserType | null;
  memoizedUserData: UserData;
  appState: string;
  notifications: any[];
  showMobileNav: boolean;
  onNavigation: (route: string) => void;
  onLogout: () => void;
  onNotificationRead: (id: number) => void;
  onToggleMobileNav: () => void;
  onShowNotifications?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentUser,
  memoizedUserData,
  appState,
  notifications,
  showMobileNav,
  onNavigation,
  onLogout,
  onNotificationRead,
  onToggleMobileNav,
  onShowNotifications
}) => {
  const isMobile = useMobile();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center space-x-4 lg:space-x-8">
            <motion.div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => onNavigation('main')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl lg:text-2xl font-bold">PropertyHub</span>
            </motion.div>
            
            {/* Desktop Navigation */}
            {currentUser && (
              <nav className="hidden md:flex space-x-4 lg:space-x-6">
                <button
                  onClick={() => onNavigation('main')}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    appState === 'main' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Properties
                </button>
                <button
                  onClick={() => onNavigation('dashboard')}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    appState === 'dashboard' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onNavigation('chat')}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    appState === 'chat' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Messages
                </button>
                {memoizedUserData.isAdminOrManager && (
                  <>
                    <button
                      onClick={() => onNavigation('admin')}
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        appState === 'admin' ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      Admin
                    </button>
                    <button
                      onClick={() => onNavigation('analytics')}
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        appState === 'analytics' ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      Analytics
                    </button>
                  </>
                )}
              </nav>
            )}
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {currentUser && (
              <>
                {/* Simple Theme Toggle */}
                <button 
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => {
                    document.documentElement.classList.toggle('dark');
                  }}
                >
                  🎨
                </button>
                
                {/* Simple Notifications */}
                <button 
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors relative"
                  onClick={onShowNotifications}
                >
                  🔔
                  <NotificationBadge />
                </button>
                
                {/* Mobile Menu Toggle for smaller screens */}
                {isMobile && (
                  <button
                    onClick={onToggleMobileNav}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors md:hidden"
                    aria-label="Toggle mobile menu"
                  >
                    <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                      <div className="w-full h-0.5 bg-current"></div>
                      <div className="w-full h-0.5 bg-current"></div>
                      <div className="w-full h-0.5 bg-current"></div>
                    </div>
                  </button>
                )}
                
                {/* User Menu */}
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <button
                    onClick={() => onNavigation('profile')}
                    className="flex items-center space-x-2 px-2 lg:px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {memoizedUserData.userInitials}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">
                      {currentUser.name}
                    </span>
                  </button>
                  
                  <button
                    onClick={onLogout}
                    className="px-3 lg:px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {currentUser && isMobile && showMobileNav && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-card/80 backdrop-blur-lg"
          >
            <nav className="flex flex-col space-y-2 p-4">
              <button
                onClick={() => onNavigation('main')}
                className={`text-left py-2 px-3 rounded-lg transition-colors ${
                  appState === 'main' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'
                }`}
              >
                Properties
              </button>
              <button
                onClick={() => onNavigation('dashboard')}
                className={`text-left py-2 px-3 rounded-lg transition-colors ${
                  appState === 'dashboard' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigation('chat')}
                className={`text-left py-2 px-3 rounded-lg transition-colors ${
                  appState === 'chat' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'
                }`}
              >
                Messages
              </button>
              {memoizedUserData.isAdminOrManager && (
                <>
                  <button
                    onClick={() => onNavigation('admin')}
                    className={`text-left py-2 px-3 rounded-lg transition-colors ${
                      appState === 'admin' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => onNavigation('analytics')}
                    className={`text-left py-2 px-3 rounded-lg transition-colors ${
                      appState === 'analytics' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'
                    }`}
                  >
                    Analytics
                  </button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

// Add default export for lazy loading
export default AppHeader;