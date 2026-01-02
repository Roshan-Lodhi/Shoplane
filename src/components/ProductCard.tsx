import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { useState } from "react";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import QuickViewDialog from "./QuickViewDialog";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const wishlist = useWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    wishlist.toggleWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    setQuickViewOpen(true);
  };

  const inWishlist = wishlist.isInWishlist(product.id);

  return (
    <>
      <Link to={`/product/${product.id}`}>
        <Card className="overflow-hidden border-0 shadow-md card-hover">
          <div className="aspect-[3/4] overflow-hidden bg-muted relative group">
            <img
              src={product.preview}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleToggleWishlist}
              >
                <Heart
                  className={`h-5 w-5 ${
                    inWishlist ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleQuickView}
              >
                <Eye className="h-5 w-5" />
              </Button>
            </div>
          </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
          <p className="text-xl font-bold text-primary">₹{product.price.toLocaleString()}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            className="w-full"
            variant="default"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </Link>
    <QuickViewDialog
      product={product}
      open={quickViewOpen}
      onOpenChange={setQuickViewOpen}
    />
    </>
  );
};

export default ProductCard;
