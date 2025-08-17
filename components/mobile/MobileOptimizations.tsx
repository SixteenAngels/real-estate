import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, PanInfo, useMotionValue, useAnimation } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, 
  MoreHorizontal, Share2, Heart, Search, Filter,
  Home, MessageSquare, User, Settings, Grid3X3
} from 'lucide-react';
import { usePWA } from '../pwa/PWAProvider';
import { useAuth } from '../auth/AuthProvider';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export function SwipeableCard({ children, onSwipeLeft, onSwipeRight, className = '' }: SwipeableCardProps) {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold && onSwipeRight) {
      // Swipe right
      controls.start({ x: 300, opacity: 0 }).then(() => {
        onSwipeRight();
        controls.set({ x: 0, opacity: 1 });
      });
    } else if (info.offset.x < -threshold && onSwipeLeft) {
      // Swipe left
      controls.start({ x: -300, opacity: 0 }).then(() => {
        onSwipeLeft();
        controls.set({ x: 0, opacity: 1 });
      });
    } else {
      // Snap back
      controls.start({ x: 0 });
    }
  }, [controls, onSwipeLeft, onSwipeRight]);

  return (
    <motion.div
      ref={cardRef}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{ x }}
      className={`touch-manipulation ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullDistance = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = useCallback(async (event: any, info: PanInfo) => {
    if (info.offset.y > 80 && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setIsPulling(false);
        pullDistance.set(0);
      }
    } else {
      setIsPulling(false);
      pullDistance.set(0);
    }
  }, [onRefresh, isRefreshing, pullDistance]);

  const handleDrag = useCallback((event: any, info: PanInfo) => {
    if (info.offset.y > 0) {
      setIsPulling(true);
      pullDistance.set(Math.min(info.offset.y, 120));
    }
  }, [pullDistance]);

  return (
    <motion.div
      ref={containerRef}
      drag="y"
      dragConstraints={{ top: 0, bottom: 120 }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className={`relative ${className}`}
    >
      {/* Pull to refresh indicator */}
      <motion.div
        style={{ y: pullDistance }}
        className="absolute top-0 left-0 right-0 flex items-center justify-center py-2 bg-muted/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: isPulling ? 1 : 0 }}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isRefreshing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
              />
              Refreshing...
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Pull to refresh
            </>
          )}
        </div>
      </motion.div>

      <motion.div style={{ y: pullDistance }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
}

export function BottomSheet({ isOpen, onClose, children, snapPoints = [0.3, 0.8] }: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(0);
  const y = useMotionValue(0);
  const controls = useAnimation();

  useEffect(() => {
    if (isOpen) {
      controls.start({ y: `${(1 - snapPoints[0]) * 100}%` });
    } else {
      controls.start({ y: '100%' });
    }
  }, [isOpen, snapPoints, controls]);

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (velocity > 500 || offset > 100) {
      onClose();
    } else {
      // Snap to nearest point
      const currentY = info.point.y;
      const windowHeight = window.innerHeight;
      const relativeY = currentY / windowHeight;

      let nearestSnap = snapPoints[0];
      let minDistance = Math.abs(relativeY - (1 - snapPoints[0]));

      snapPoints.forEach(snap => {
        const distance = Math.abs(relativeY - (1 - snap));
        if (distance < minDistance) {
          minDistance = distance;
          nearestSnap = snap;
        }
      });

      setCurrentSnap(snapPoints.indexOf(nearestSnap));
      controls.start({ y: `${(1 - nearestSnap) * 100}%` });
    }
  }, [snapPoints, onClose, controls]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Bottom Sheet */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ y: '100%' }}
        className="fixed bottom-0 left-0 right-0 bg-background rounded-t-xl shadow-2xl z-50 touch-manipulation"
        style={{ maxHeight: '90vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-4 pb-safe-area-inset overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </motion.div>
    </>
  );
}

interface MobileNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileNavigation({ currentTab, onTabChange }: MobileNavigationProps) {
  const { user } = useAuth();
  const { isInstalled } = usePWA();

  const tabs = [
    { id: 'main', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'dashboard', label: 'Dashboard', icon: Grid3X3 },
    { id: 'chat', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={`fixed bottom-0 left-0 right-0 bg-background border-t safe-area-pb z-30 ${
        isInstalled ? 'pb-0' : 'pb-2'
      }`}
    >
      <div className="flex items-center justify-around py-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center p-2 rounded-lg touch-target"
              whileTap={{ scale: 0.95 }}
            >
              <div className={`p-2 rounded-lg ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs mt-1 ${
                isActive ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}>
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

interface VirtualizedListProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualizedList({ 
  items, 
  itemHeight, 
  containerHeight, 
  renderItem, 
  className = '' 
}: VirtualizedListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => renderItem(item, startIndex + index))}
        </div>
      </div>
    </div>
  );
}

interface TouchGesturesProps {
  children: React.ReactNode;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPinch?: (scale: number) => void;
  onDoubleTap?: () => void;
  className?: string;
}

export function TouchGestures({
  children,
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onPinch,
  onDoubleTap,
  className = ''
}: TouchGesturesProps) {
  const [lastTap, setLastTap] = useState(0);
  const [startDistance, setStartDistance] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && onPinch) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setStartDistance(distance);
    }
  }, [onPinch]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && onPinch && startDistance) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = distance / startDistance;
      onPinch(scale);
    }
  }, [onPinch, startDistance]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const now = Date.now();
    const timeDiff = now - lastTap;
    
    if (timeDiff < 300 && timeDiff > 0 && onDoubleTap) {
      onDoubleTap();
    }
    
    setLastTap(now);
  }, [lastTap, onDoubleTap]);

  return (
    <motion.div
      className={`touch-manipulation ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      drag
      onDragEnd={(event, info) => {
        const threshold = 50;
        const velocity = 500;
        
        if (Math.abs(info.velocity.x) > Math.abs(info.velocity.y)) {
          if (info.velocity.x > velocity && onSwipeRight) {
            onSwipeRight();
          } else if (info.velocity.x < -velocity && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          if (info.velocity.y > velocity && onSwipeDown) {
            onSwipeDown();
          } else if (info.velocity.y < -velocity && onSwipeUp) {
            onSwipeUp();
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export default {
  SwipeableCard,
  PullToRefresh,
  BottomSheet,
  MobileNavigation,
  VirtualizedList,
  TouchGestures
};