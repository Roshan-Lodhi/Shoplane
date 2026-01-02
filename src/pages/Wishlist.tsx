import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const Wishlist = () => {
  const { wishlistItems, loading } = useWishlist();

  const wishlistProducts = wishlistItems
    .map((item) => products.find((p) => p.id === item.product_id))
    .filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">My Wishlist</h1>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground">Start adding products you love!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard key={product!.id} product={product!} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
