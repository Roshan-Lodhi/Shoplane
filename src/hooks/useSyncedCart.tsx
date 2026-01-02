import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/product";
import { toast } from "sonner";

export const useSyncedCart = (
  cart: CartItem[],
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
) => {
  // Sync cart to database when user is logged in
  const syncCartToDatabase = useCallback(async (cartItems: CartItem[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data: existingCart } = await supabase
        .from('saved_carts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingCart) {
        await supabase
          .from('saved_carts')
          .update({ cart_items: cartItems as any })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('saved_carts')
          .insert([{ user_id: user.id, cart_items: cartItems as any }]);
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  }, []);

  // Load cart from database on login
  const loadCartFromDatabase = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_carts')
        .select('cart_items')
        .eq('user_id', user.id)
        .single();

      if (!error && data?.cart_items) {
        const savedItems = data.cart_items as unknown as CartItem[];
        const localCart = JSON.parse(localStorage.getItem("shoplane-cart") || "[]") as CartItem[];
        
        // Merge local and saved cart
        if (localCart.length > 0 && savedItems.length > 0) {
          const mergedCart = [...savedItems];
          
          localCart.forEach(localItem => {
            const existingIndex = mergedCart.findIndex(item => item.id === localItem.id);
            if (existingIndex === -1) {
              mergedCart.push(localItem);
            } else {
              // Keep the higher quantity
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
          toast.success("Cart restored from your account");
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }, [setCart]);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Delay to ensure user data is ready
          setTimeout(() => {
            loadCartFromDatabase();
          }, 500);
        }
      }
    );

    // Check if already logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        loadCartFromDatabase();
      }
    });

    return () => subscription.unsubscribe();
  }, [loadCartFromDatabase]);

  // Sync cart changes to database
  useEffect(() => {
    if (cart.length > 0) {
      const timeoutId = setTimeout(() => {
        syncCartToDatabase(cart);
      }, 1000); // Debounce sync

      return () => clearTimeout(timeoutId);
    }
  }, [cart, syncCartToDatabase]);

  return { syncCartToDatabase, loadCartFromDatabase };
};
