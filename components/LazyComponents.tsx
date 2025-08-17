import { lazy } from 'react';

// Simple fallback component for missing features
export const FallbackComponent = ({ title, onBack }: { title: string; onBack?: () => void }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-muted-foreground mb-6">This feature is currently under development.</p>
      {onBack && (
        <button
          onClick={onBack}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          ← Go Back
        </button>
      )}
    </div>
  </div>
);

// Enhanced lazy loading with better error handling and simpler fallbacks
const createLazyComponent = (importFunc: () => Promise<any>, componentName: string) => {
  return lazy(() => 
    importFunc().catch((error) => {
      console.warn(`Failed to load ${componentName}:`, error);
      return {
        default: ({ onBack, ...props }: any) => 
          <FallbackComponent title={`${componentName} Coming Soon`} onBack={onBack} />
      };
    })
  );
};

// Lazy loaded components with proper error handling
export const UserDashboard = lazy(() => import('./UserDashboard'));

export const ProfileSettings = createLazyComponent(
  () => import('./ProfileSettings'),
  'Profile Settings'
);

export const AdminPanel = createLazyComponent(
  () => import('./AdminPanel'),
  'Admin Panel'
);

export const EnhancedChatRoom = createLazyComponent(
  () => import('./EnhancedChatRoom'),
  'Messages'
);

export const NotificationCenter = lazy(() => 
  import('./NotificationCenter').catch(() => ({
    default: () => (
      <div className="relative">
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          🔔
        </button>
      </div>
    )
  }))
);

export const ThemeSelector = lazy(() => 
  import('./ThemeSelector').catch(() => ({
    default: () => (
      <div className="relative">
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          🎨
        </button>
      </div>
    )
  }))
);

export const EnhancedMapView = createLazyComponent(
  () => import('./EnhancedMapView'),
  'Map View'
);

export const BookingDirections = createLazyComponent(
  () => import('./BookingDirections'),
  'Directions'
);

export const PropertyTourScheduler = createLazyComponent(
  () => import('./PropertyTourScheduler'),
  'Tour Scheduler'
);

export const OfflineMapManager = createLazyComponent(
  () => import('./OfflineMapManager'),
  'Offline Maps'
);