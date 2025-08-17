import React from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Building2, Home, MapPin, Users, TrendingUp, Shield, LogIn, UserPlus } from 'lucide-react';
import { AppState } from '../types';

interface AuthLandingProps {
  onNavigate: (state: AppState) => void;
}

export function AuthLanding({ onNavigate }: AuthLandingProps) {
  const features = [
    {
      icon: Home,
      title: 'Find Your Dream Property',
      description: 'Browse thousands of verified properties across different categories'
    },
    {
      icon: Users,
      title: 'Trusted Community',
      description: 'Connect with verified hosts, agents, and property owners'
    },
    {
      icon: TrendingUp,
      title: 'Smart Investment',
      description: 'Make informed decisions with market insights and analytics'
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Protected payments and verified property documentation'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* 3D Logo */}
            <motion.div
              className="relative w-24 h-24 mx-auto mb-8"
              initial={{ scale: 0, rotateY: -180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.div
                className="w-full h-full bg-primary rounded-2xl shadow-xl flex items-center justify-center"
                animate={{ 
                  rotateY: [0, 15, 0, -15, 0],
                  rotateX: [0, 10, 0, -10, 0]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Building2 className="w-12 h-12 text-primary-foreground" />
              </motion.div>
              
              {/* Floating Elements */}
              <motion.div
                className="absolute -top-2 -right-2 bg-primary/20 backdrop-blur-sm rounded-full p-1"
                animate={{ 
                  y: [-5, 5, -5],
                  rotate: [0, 180, 360] 
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Home className="w-4 h-4 text-primary" />
              </motion.div>
              
              <motion.div
                className="absolute -bottom-2 -left-2 bg-primary/20 backdrop-blur-sm rounded-full p-1"
                animate={{ 
                  y: [5, -5, 5],
                  rotate: [360, 180, 0] 
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              >
                <MapPin className="w-4 h-4 text-primary" />
              </motion.div>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Welcome to{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                PropertyHub
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Your gateway to finding, listing, and managing properties. 
              Discover your dream home, office, or investment opportunity.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => onNavigate('signup')}
                  size="lg"
                  className="text-lg px-8 py-6 shadow-xl"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Get Started
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, rotateY: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => onNavigate('login')}
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 shadow-xl backdrop-blur-sm"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-4">Why Choose PropertyHub?</h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of users who trust us with their property needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + index * 0.1, duration: 0.8 }}
              whileHover={{ 
                scale: 1.05,
                rotateY: 10,
                rotateX: 5
              }}
              className="group"
            >
              <Card className="h-full backdrop-blur-sm bg-card/50 border-2 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <motion.div
                    className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors"
                    whileHover={{ rotateY: 180 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <motion.div
        className="bg-primary/5 backdrop-blur-sm py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '10K+', label: 'Properties Listed' },
              { number: '50K+', label: 'Happy Customers' },
              { number: '500+', label: 'Cities Covered' },
              { number: '99%', label: 'Success Rate' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.7 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.1, rotateY: 15 }}
              >
                <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}