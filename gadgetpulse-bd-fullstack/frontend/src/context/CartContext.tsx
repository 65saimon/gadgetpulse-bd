'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  vat: number;
  grandTotal: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  couponCode: string;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  deliveryLocation: 'dhaka' | 'outside';
  setDeliveryLocation: (loc: 'dhaka' | 'outside') => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [deliveryLocation, setDeliveryLocation] = useState<'dhaka' | 'outside'>('dhaka');

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('gp_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {}
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('gp_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, variant?: ProductVariant, quantity = 1) => {
    setCart((prevCart) => {
      const variantId = variant?.id;
      const existingIndex = prevCart.findIndex(
        (item) => item.productId === product.id && item.variantId === variantId
      );

      const unitPrice = variant
        ? (variant.discountPrice || variant.regularPrice)
        : (product.discountPrice || product.regularPrice);

      const maxStock = variant ? variant.stockQuantity : product.stockQuantity;

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = Math.min(maxStock, updated[existingIndex].quantity + quantity);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: newQty * unitPrice,
        };
        return updated;
      } else {
        const itemQty = Math.min(maxStock, quantity);
        return [
          ...prevCart,
          {
            productId: product.id,
            variantId,
            product,
            variant,
            quantity: itemQty,
            unitPrice,
            totalPrice: itemQty * unitPrice,
          },
        ];
      }
    });

    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prev) => prev.filter((item) => !(item.productId === productId && item.variantId === variantId)));
  };

  const updateQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          const maxStock = item.variant ? item.variant.stockQuantity : item.product.stockQuantity;
          const cappedQty = Math.min(maxStock, quantity);
          return {
            ...item,
            quantity: cappedQty,
            totalPrice: cappedQty * item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setDiscountPercent(0);
    localStorage.removeItem('gp_cart');
  };

  const applyCoupon = (code: string) => {
    if (code.toUpperCase() === 'GADGET10') {
      setCouponCode('GADGET10');
      setDiscountPercent(10);
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const discount = Math.round((subtotal * discountPercent) / 100);
  const deliveryFee = subtotal >= 50000 || cart.length === 0 ? 0 : (deliveryLocation === 'dhaka' ? 60 : 120);
  const vat = Math.round((subtotal - discount) * 0.05); // 5% VAT
  const grandTotal = subtotal > 0 ? subtotal - discount + deliveryFee + vat : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount,
        deliveryFee,
        vat,
        grandTotal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        couponCode,
        applyCoupon,
        removeCoupon,
        deliveryLocation,
        setDeliveryLocation,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
