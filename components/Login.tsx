import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Building2, Shield, Smartphone } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { User } from '../types';
import { mockUsers } from '../data/mockData';

interface LoginProps {
  onLogin: (user: User) => void;
  onSignup: () => void;
  onBack: () => void;
}

export function Login({ onLogin, onSignup, onBack }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [showTwoFA, setShowTwoFA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find user by email for demo
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
      // Simulate 2FA requirement for admin/manager roles
      if (user.role === 'admin' || user.role === 'manager') {
        setPendingUser(user);
        setShowTwoFA(true);
        toast.info('Two-factor authentication required for enhanced security');
      } else {
        onLogin(user);
        toast.success(`Welcome back, ${user.name}! 🎉`);
      }
    } else {
      toast.error('Invalid email or password');
    }
    
    setIsLoading(false);
  };

  const handleTwoFASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate 2FA verification
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo, accept any 6-digit code
    if (twoFACode.length === 6) {
      onLogin(pendingUser!);
      toast.success(`Welcome back, ${pendingUser!.name}! 🎉 Secure login verified.`);
      setShowTwoFA(false);
      setPendingUser(null);
      setTwoFACode('');
    } else {
      toast.error('Invalid authentication code. Please try again.');
    }

    setIsLoading(false);
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setIsOAuthLoading(provider);
    
    // Simulate OAuth process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create a demo OAuth user
    const oauthUser: User = {
      id: `oauth_${Date.now()}`,
      name: provider === 'google' ? 'Google User' : 'Apple User',
      email: `${provider}user@example.com`,
      role: 'user',
      avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face`,
      joinDate: new Date().toISOString().split('T')[0],
      preferences: {
        theme: 'light',
        notifications: true,
        emailUpdates: true,
        currency: 'USD',
        language: 'en',
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
          showPhone: false,
          allowDataCollection: true,
          allowMarketing: false,
          allowAnalytics: true,
          twoFactorEnabled: false
        }
      }
    };

    onLogin(oauthUser);
    toast.success(`Welcome! Successfully signed in with ${provider === 'google' ? 'Google' : 'Apple'} 🎉`);
    setIsOAuthLoading(null);
  };

  const handleQuickLogin = (user: User) => {
    // Same 2FA check for quick login
    if (user.role === 'admin' || user.role === 'manager') {
      setPendingUser(user);
      setShowTwoFA(true);
      toast.info('Two-factor authentication required for enhanced security');
    } else {
      onLogin(user);
      toast.success(`Welcome back, ${user.name}! 🎉`);
    }
  };

  if (showTwoFA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="backdrop-blur-sm bg-card/80 border-2 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <motion.div
                className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Shield className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
              <CardDescription>
                Enter the 6-digit code from your authenticator app
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleTwoFASubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twofa">Authentication Code</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="twofa"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={twoFACode}
                      onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="pl-10 text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    For demo: enter any 6-digit number (e.g., 123456)
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || twoFACode.length !== 6}>
                  {isLoading ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    'Verify & Sign In'
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setShowTwoFA(false);
                    setPendingUser(null);
                    setTwoFACode('');
                  }}
                >
                  Cancel
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className="flex items-center text-muted-foreground hover:text-foreground mb-6 p-2 -ml-2 rounded-lg hover:bg-muted/50 transition-colors"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </motion.button>

        <motion.div
          className="relative"
          whileHover={{ rotateY: 5, rotateX: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Card className="backdrop-blur-sm bg-card/80 border-2 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <motion.div
                className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4"
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Building2 className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Sign in to your PropertyHub account</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* OAuth Login Options */}
              <motion.div
                className="space-y-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthLogin('google')}
                  disabled={isOAuthLoading !== null}
                >
                  {isOAuthLoading === 'google' ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Continue with Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthLogin('apple')}
                  disabled={isOAuthLoading !== null}
                >
                  {isOAuthLoading === 'apple' ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                    </svg>
                  )}
                  Continue with Apple
                </Button>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-card px-2 text-xs text-muted-foreground">or continue with email</span>
                </div>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading || isOAuthLoading !== null}
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Quick Login for Demo */}
              <motion.div
                className="pt-4 border-t"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-sm text-muted-foreground text-center mb-3">Quick login for demo:</p>
                <div className="space-y-2">
                  {mockUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={() => handleQuickLogin(user)}
                        disabled={isLoading || isOAuthLoading !== null}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            {(user.role === 'admin' || user.role === 'manager') && (
                              <Shield className="w-3 h-3 mr-2 text-orange-500" />
                            )}
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {user.role}
                                {(user.role === 'admin' || user.role === 'manager') && ' (2FA required)'}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="text-center pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    onClick={onSignup}
                    className="text-primary hover:underline font-medium"
                    disabled={isLoading || isOAuthLoading !== null}
                  >
                    Sign up
                  </button>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}