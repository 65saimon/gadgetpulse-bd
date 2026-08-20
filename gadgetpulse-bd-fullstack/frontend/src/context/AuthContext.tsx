'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, User } from '../types';
import { apiRequest } from '../lib/api';

interface AuthContextType {
  customer: Customer | null;
  adminUser: User | null;
  customerToken: string | null;
  adminToken: string | null;
  isLoading: boolean;
  loginCustomer: (token: string, customerData: Customer) => void;
  logoutCustomer: () => void;
  loginAdmin: (token: string, userData: User) => void;
  logoutAdmin: () => void;
  refreshCustomerProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [customerToken, setCustomerToken] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load tokens from localStorage
    const storedCustomerToken = localStorage.getItem('gp_customer_token');
    const storedCustomer = localStorage.getItem('gp_customer_user');
    const storedAdminToken = localStorage.getItem('gp_admin_token');
    const storedAdmin = localStorage.getItem('gp_admin_user');

    if (storedCustomerToken && storedCustomer) {
      setCustomerToken(storedCustomerToken);
      try {
        setCustomer(JSON.parse(storedCustomer));
      } catch (e) {}
    }

    if (storedAdminToken && storedAdmin) {
      setAdminToken(storedAdminToken);
      try {
        setAdminUser(JSON.parse(storedAdmin));
      } catch (e) {}
    }

    setIsLoading(false);
  }, []);

  const loginCustomer = (token: string, customerData: Customer) => {
    setCustomerToken(token);
    setCustomer(customerData);
    localStorage.setItem('gp_customer_token', token);
    localStorage.setItem('gp_customer_user', JSON.stringify(customerData));
  };

  const logoutCustomer = () => {
    setCustomerToken(null);
    setCustomer(null);
    localStorage.removeItem('gp_customer_token');
    localStorage.removeItem('gp_customer_user');
  };

  const loginAdmin = (token: string, userData: User) => {
    setAdminToken(token);
    setAdminUser(userData);
    localStorage.setItem('gp_admin_token', token);
    localStorage.setItem('gp_admin_user', JSON.stringify(userData));
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('gp_admin_token');
    localStorage.removeItem('gp_admin_user');
  };

  const refreshCustomerProfile = async () => {
    if (!customerToken) return;
    try {
      const res = await apiRequest('/auth/customer/profile', {}, customerToken);
      if (res.success && res.customer) {
        setCustomer(res.customer);
        localStorage.setItem('gp_customer_user', JSON.stringify(res.customer));
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        adminUser,
        customerToken,
        adminToken,
        isLoading,
        loginCustomer,
        logoutCustomer,
        loginAdmin,
        logoutAdmin,
        refreshCustomerProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
