import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Home, MapPin } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(onComplete, 800); // Allow exit animation to complete
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: isLoading ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center">
        {/* 3D Logo Animation */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.5, rotateY: -180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <motion.div
            className="relative w-32 h-32 mx-auto"
            animate={{ 
              rotateY: [0, 360],
              rotateX: [0, 15, 0, -15, 0] 
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <motion.div
              className="absolute inset-0 bg-white rounded-2xl shadow-2xl flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              style={{
                transformStyle: "preserve-3d",
                transform: "translateZ(20px)"
              }}
            >
              <Building2 className="w-16 h-16 text-primary" />
            </motion.div>
            
            {/* Floating Icons */}
            <motion.div
              className="absolute -top-4 -right-4 bg-white/20 backdrop-blur-sm rounded-full p-2"
              animate={{ 
                y: [-10, 10, -10],
                rotate: [0, 180, 360] 
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Home className="w-6 h-6 text-white" />
            </motion.div>
            
            <motion.div
              className="absolute -bottom-4 -left-4 bg-white/20 backdrop-blur-sm rounded-full p-2"
              animate={{ 
                y: [10, -10, 10],
                rotate: [360, 180, 0] 
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <MapPin className="w-6 h-6 text-white" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* App Name */}
        <motion.h1
          className="text-4xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          PropertyHub
        </motion.h1>

        <motion.p
          className="text-white/80 text-lg mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Your Gateway to Dream Properties
        </motion.p>

        {/* Loading Animation */}
        <motion.div
          className="flex justify-center items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-white rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}