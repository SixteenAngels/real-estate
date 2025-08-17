import React, { createContext, useContext, ReactNode } from 'react';

interface PaymentContextType {
  processPayment: (amount: number, method: string) => Promise<boolean>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const processPayment = async (amount: number, method: string): Promise<boolean> => {
    // Mock payment processing
    console.log(`Processing payment: $${amount} via ${method}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return Math.random() > 0.1; // 90% success rate
  };

  return (
    <PaymentContext.Provider value={{ processPayment }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}