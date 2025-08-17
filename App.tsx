import React from 'react';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './components/auth/AuthProvider';
import { WebSocketProvider } from './components/realtime/WebSocketProvider';
import { PWAProvider } from './components/pwa/PWAProvider';
import { PushNotificationProvider } from './components/PushNotificationService';
import { SplashScreen } from './components/SplashScreen';
import { AuthLanding } from './components/AuthLanding';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { AppHeader } from './components/AppHeader';
import { Marketplace } from './components/Marketplace';
import { PropertyDetailsView } from './components/PropertyDetailsView';
import { UserDashboard } from './components/UserDashboard';
import { AdminPanel } from './components/AdminPanel';
import { PropertyAnalyticsDashboard } from './components/analytics/PropertyAnalyticsDashboard';
import { ProfileSettings } from './components/ProfileSettings';
import { EnhancedChatSystem } from './components/chat/EnhancedChatSystem';
import { NotificationCenter } from './components/NotificationCenter';
import { MobileNavigation } from './components/mobile/MobileOptimizations';
import { MobilePropertyList } from './components/mobile/MobileAppWrapper';
import { EnhancedSearchProvider } from './components/EnhancedSearchProvider';
import { GeocodingProvider } from './components/geocoding/GeocodingProvider';
import { useAppCore } from './hooks/useAppCore';
import { useMobile } from './hooks/useMobile';
import { toast } from 'sonner@2.0.3';
import { errorTracker, performanceMonitor } from './utils/errorTracking';
import { testingUtils } from './utils/testingUtils';
import { offlineManager } from './utils/offlineManager';
import { User as UserType } from './types';

function AppCore() {
  const {
    appState,
    setAppState,
    currentUser,
    properties,
    filters,
    setFilters,
    selectedProperty,
    setSelectedProperty,
    showMobileNav,
    notifications,
    memoizedUserData,
    handleLogin,
    handleLogout,
    handlePropertySelect,
    handleNavigation,
    handleNotificationRead,
    handleToggleMobileNav
  } = useAppCore();

  const isMobile = useMobile();
  const [showNotificationCenter, setShowNotificationCenter] = React.useState(false);

  // Initialize with basic error handling
  React.useEffect(() => {
    try {
      console.log('PropertyHub initialized successfully');
      
      // Basic online/offline monitoring
      const handleOnline = () => {
        toast.success('Internet connection restored!');
      };

      const handleOffline = () => {
        toast.warning('You are currently offline');
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } catch (error) {
      console.error('Error in AppCore initialization:', error);
    }
  }, []);

  // Handle URL parameters
  React.useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get('action');
      const propertyId = urlParams.get('property');

      if (action && currentUser) {
        switch (action) {
          case 'search':
            handleNavigation('main');
            break;
          case 'dashboard':
            handleNavigation('dashboard');
            break;
          case 'chat':
            handleNavigation('chat');
            break;
          case 'favorites':
            handleNavigation('dashboard');
            break;
        }
      }

      if (propertyId && currentUser) {
        const property = properties.find(p => p.id === propertyId);
        if (property) {
          setSelectedProperty(property);
          toast.success(`Opening property: ${property.title}`);
        }
      }
    } catch (error) {
      console.error('Error in URL parameter handling:', error);
    }
  }, [currentUser, properties, handleNavigation, setSelectedProperty]);

  const handleRefresh = async () => {
    try {
      toast.info('Refreshing PropertyHub...');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error in app refresh:', error);
      toast.error('Unable to refresh');
    }
  };
  
  // Show splash screen first
  if (appState === 'splash') {
    return <SplashScreen onComplete={() => setAppState('auth-landing')} />;
  }

  // Show authentication screens
  if (appState === 'auth-landing') {
    return <AuthLanding onNavigate={setAppState} />;
  }

  if (appState === 'login') {
    return (
      <Login 
        onLogin={handleLogin}
        onBack={() => setAppState('auth-landing')}
        onSignup={() => setAppState('signup')}
      />
    );
  }

  if (appState === 'signup') {
    return (
      <Signup 
        onSignup={handleLogin}
        onBack={() => setAppState('auth-landing')}
        onLogin={() => setAppState('login')}
      />
    );
  }

  // Main application layout with header
  return (
    <EnhancedSearchProvider>
      <GeocodingProvider>
        <div className={`min-h-screen bg-background transition-all duration-500 ${isMobile ? 'mobile-viewport' : ''}`}>
          <AppHeader 
            currentUser={currentUser}
            memoizedUserData={memoizedUserData}
            appState={appState}
            notifications={notifications}
            showMobileNav={showMobileNav}
            onNavigation={handleNavigation}
            onLogout={handleLogout}
            onNotificationRead={handleNotificationRead}
            onToggleMobileNav={handleToggleMobileNav}
            onShowNotifications={() => setShowNotificationCenter(true)}
          />

          <main className={`transition-all duration-500 min-h-screen ${isMobile ? 'pb-20' : ''}`}>
            {/* Property Details View - Shows when a property is selected */}
            {selectedProperty ? (
              <PropertyDetailsView 
                selectedProperty={selectedProperty}
                currentUser={currentUser!}
                onBack={() => setSelectedProperty(null)}
                onNavigation={handleNavigation}
              />
            ) : (
              <>
                {/* Main Content Based on App State */}
                {appState === 'main' && (
                  isMobile ? (
                    <MobilePropertyList
                      properties={properties}
                      onPropertySelect={handlePropertySelect}
                      onRefresh={handleRefresh}
                      loading={false}
                      currentUser={currentUser}
                    />
                  ) : (
                    <Marketplace
                      properties={properties}
                      filters={filters}
                      setFilters={setFilters}
                      onPropertySelect={handlePropertySelect}
                      currentUser={currentUser}
                    />
                  )
                )}

                {appState === 'dashboard' && currentUser && (
                  <UserDashboard
                    currentUser={currentUser}
                    properties={properties}
                    onPropertySelect={handlePropertySelect}
                  />
                )}

                {appState === 'admin' && currentUser && (
                  <AdminPanel
                    currentUser={currentUser}
                  />
                )}

                {appState === 'analytics' && currentUser && (
                  <div className="min-h-screen bg-background pt-16">
                    <div className="container mx-auto px-4 py-6">
                      <PropertyAnalyticsDashboard />
                    </div>
                  </div>
                )}

                {appState === 'profile' && currentUser && (
                  <div className="min-h-screen bg-background">
                    <ProfileSettings
                      currentUser={currentUser}
                      onUpdateUser={(updatedUser) => {
                        console.log('Profile updated:', updatedUser);
                        toast.success('Profile updated successfully!');
                      }}
                    />
                  </div>
                )}

                {appState === 'chat' && currentUser && (
                  <div className={`min-h-screen bg-background ${isMobile ? 'pt-0' : 'pt-16'}`}>
                    {!isMobile && (
                      <div className="container mx-auto px-4 py-6">
                        <EnhancedChatSystem 
                          className="rounded-lg border shadow-lg"
                          height="calc(100vh - 120px)"
                        />
                      </div>
                    )}
                    {isMobile && (
                      <EnhancedChatSystem 
                        className="w-full"
                        height="100vh"
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </main>

          {/* Mobile Navigation */}
          {isMobile && (
            <MobileNavigation 
              currentTab={appState} 
              onTabChange={handleNavigation}
            />
          )}

          {/* Notification Center */}
          <NotificationCenter
            isOpen={showNotificationCenter}
            onClose={() => setShowNotificationCenter(false)}
          />

          <Toaster position="bottom-right" />
        </div>
      </GeocodingProvider>
    </EnhancedSearchProvider>
  );
}

function AppCoreWrapper() {
  return (
    <PushNotificationProvider>
      <AppCore />
    </PushNotificationProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PWAProvider>
          <AuthProvider>
            <WebSocketProvider>
              <AppCoreWrapper />
            </WebSocketProvider>
          </AuthProvider>
        </PWAProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;