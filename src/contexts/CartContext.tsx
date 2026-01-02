import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CartItem, Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("shoplane-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("shoplane-cart", JSON.stringify(cart));
  }, [cart]);

  // Sync cart to database
  const syncCartToDatabase = useCallback(async (cartItems: CartItem[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data: existingCart } = await supabase
        .from('saved_carts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingCart) {
        await supabase
          .from('saved_carts')
          .update({ cart_items: cartItems as any })
          .eq('user_id', user.id);
      } else if (cartItems.length > 0) {
        await supabase
          .from('saved_carts')
          .insert([{ user_id: user.id, cart_items: cartItems as any }]);
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  }, []);

  // Load cart from database
  const loadCartFromDatabase = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_carts')
        .select('cart_items')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data?.cart_items) {
        const savedItems = data.cart_items as unknown as CartItem[];
        const localCart = JSON.parse(localStorage.getItem("shoplane-cart") || "[]") as CartItem[];
        
        if (localCart.length > 0 && savedItems.length > 0) {
          const mergedCart = [...savedItems];
          
          localCart.forEach(localItem => {
            const existingIndex = mergedCart.findIndex(item => item.id === localItem.id);
            if (existingIndex === -1) {
              mergedCart.push(localItem);
            } else {
              mergedCart[existingIndex].count = Math.max(
                mergedCart[existingIndex].count,
                localItem.count
              );
            }
          });

          setCart(mergedCart);
          toast.success("Cart synced across devices");
        } else if (savedItems.length > 0) {
          setCart(savedItems);
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setTimeout(() => loadCartFromDatabase(), 500);
        }
      }
    );

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) loadCartFromDatabase();
    });

    return () => subscription.unsubscribe();
  }, [loadCartFromDatabase]);

  // Sync changes to database (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      syncCartToDatabase(cart);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [cart, syncCartToDatabase]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, count: item.count + 1 } : item
        );
      }
      return [...prev, { ...product, count: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, count: quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.count, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
