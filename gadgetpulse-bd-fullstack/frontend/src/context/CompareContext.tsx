'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

interface CompareContextType {
  compareProducts: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  compareCount: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('gp_compare');
    if (saved) {
      try {
        setCompareProducts(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gp_compare', JSON.stringify(compareProducts));
  }, [compareProducts]);

  const addToCompare = (product: Product) => {
    setCompareProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      if (prev.length >= 4) {
        alert('You can compare up to 4 devices at a time.');
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId: string) => {
    setCompareProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareProducts([]);
    localStorage.removeItem('gp_compare');
  };

  const isInCompare = (productId: string) => {
    return compareProducts.some((p) => p.id === productId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareProducts,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        compareCount: compareProducts.length,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
