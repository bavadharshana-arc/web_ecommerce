import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    shippingFee: 0,
    tax: 0,
    totalAmount: 0,
    totalItemsCount: 0,
    freeShippingThreshold: 100,
    qualifiesForFreeShipping: false,
  });
  const [loading, setLoading] = useState(false);

  // Fetch cart whenever user authenticates
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setCartSummary({
        subtotal: 0,
        shippingFee: 0,
        tax: 0,
        totalAmount: 0,
        totalItemsCount: 0,
        freeShippingThreshold: 100,
        qualifiesForFreeShipping: false,
      });
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.success && res.data) {
        setCartItems(res.data.items || []);
        setCartSummary(
          res.data.summary || {
            subtotal: 0,
            shippingFee: 0,
            tax: 0,
            totalAmount: 0,
            totalItemsCount: 0,
            freeShippingThreshold: 100,
            qualifiesForFreeShipping: false,
          }
        );
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, user?.id]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      showToast('Please log in to add items to your cart', 'info');
      return { success: false, requireAuth: true };
    }

    try {
      setLoading(true);
      const res = await api.post('/cart/items', { productId, quantity });
      if (res.success && res.data) {
        setCartItems(res.data.items || []);
        setCartSummary(res.data.summary);
        showToast('Item added to cart!', 'success');
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (error) {
      showToast(error.message || 'Failed to add item to cart', 'error');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (!isAuthenticated) return;

    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    try {
      const res = await api.put(`/cart/items/${cartItemId}`, { quantity });
      if (res.success && res.data) {
        setCartItems(res.data.items || []);
        setCartSummary(res.data.summary);
        return { success: true };
      }
    } catch (error) {
      showToast(error.message || 'Failed to update quantity', 'error');
      // Re-fetch cart to reset optimistic / stale state
      fetchCart();
      return { success: false, message: error.message };
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!isAuthenticated) return;

    try {
      const res = await api.delete(`/cart/items/${cartItemId}`);
      if (res.success && res.data) {
        setCartItems(res.data.items || []);
        setCartSummary(res.data.summary);
        showToast('Item removed from cart', 'info');
        return { success: true };
      }
    } catch (error) {
      showToast(error.message || 'Failed to remove item', 'error');
      return { success: false };
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      const res = await api.delete('/cart');
      if (res.success && res.data) {
        setCartItems([]);
        setCartSummary(res.data.summary);
        return { success: true };
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      return { success: false };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartSummary,
        loading,
        itemCount: cartSummary.totalItemsCount || 0,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
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
