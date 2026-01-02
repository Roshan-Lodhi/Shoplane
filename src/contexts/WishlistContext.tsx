import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface WishlistItem {
  id: string;
  product_id: number;
  created_at: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
      setLoading(false);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from("wishlists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error: any) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlistItems.some((item) => item.product_id === productId);
  };

  const toggleWishlist = async (productId: number) => {
    if (!user) {
      toast.error("Please sign in to use wishlist");
      return;
    }

    try {
      const inWishlist = isInWishlist(productId);

      if (inWishlist) {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("product_id", productId);

        if (error) throw error;
        setWishlistItems((prev) => prev.filter((item) => item.product_id !== productId));
        toast.success("Removed from wishlist");
      } else {
        const { data, error } = await supabase
          .from("wishlists")
          .insert({ 
            product_id: productId,
            user_id: user.id 
          })
          .select()
          .single();

        if (error) throw error;
        setWishlistItems((prev) => [data, ...prev]);
        toast.success("Added to wishlist");
      }
    } catch (error: any) {
      toast.error("Failed to update wishlist");
      console.error("Error updating wishlist:", error);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, isInWishlist, toggleWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
