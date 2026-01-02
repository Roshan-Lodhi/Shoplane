import { ShoppingCart, Heart, X } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";

interface QuickViewDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuickViewDialog = ({ product, open, onOpenChange }: QuickViewDialogProps) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <div className="grid md:grid-cols-2 gap-6 pt-6">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={product.preview}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <p className="text-lg text-muted-foreground">{product.brand}</p>
            </div>

            <p className="text-3xl font-bold text-primary mb-4">
              ₹{product.price.toLocaleString()}
            </p>

            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                {product.isAccessory ? "Accessory" : "Clothing"}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                In Stock
              </span>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex gap-3 mt-auto">
              <Button onClick={handleAddToCart} className="flex-1">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                onClick={handleToggleWishlist}
              >
                <Heart
                  className={`h-4 w-4 ${
                    isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewDialog;
