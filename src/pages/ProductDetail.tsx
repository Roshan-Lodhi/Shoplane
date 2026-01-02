import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ShoppingCart, ArrowLeft, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ProductReviews from "@/components/ProductReviews";
import SizeGuide from "@/components/SizeGuide";
import AIRecommendations from "@/components/AIRecommendations";
import ProductSpecifications from "@/components/ProductSpecifications";
import Product360View from "@/components/Product360View";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const [selectedImage, setSelectedImage] = useState(0);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const product = products.find((p) => p.id === Number(id));

  const allImages = product?.images?.length ? product.images : (product ? [product.preview] : []);

  const checkScrollButtons = () => {
    if (thumbnailRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = thumbnailRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbnailRef.current) {
      const scrollAmount = 100;
      thumbnailRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!thumbnailRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - thumbnailRef.current.offsetLeft);
    setScrollLeft(thumbnailRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !thumbnailRef.current) return;
    e.preventDefault();
    const x = e.pageX - thumbnailRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    thumbnailRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!thumbnailRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - thumbnailRef.current.offsetLeft);
    setScrollLeft(thumbnailRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !thumbnailRef.current) return;
    const x = e.touches[0].pageX - thumbnailRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    thumbnailRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product.id);
      setSelectedImage(0);
    }
  }, [product, addToRecentlyViewed]);

  useEffect(() => {
    // Delay check to ensure images are rendered
    const timeoutId = setTimeout(checkScrollButtons, 100);
    
    const thumbnailEl = thumbnailRef.current;
    if (thumbnailEl) {
      thumbnailEl.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      
      // Also check when images load
      const images = thumbnailEl.querySelectorAll('img');
      images.forEach(img => {
        img.addEventListener('load', checkScrollButtons);
      });
      
      return () => {
        clearTimeout(timeoutId);
        thumbnailEl.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
        images.forEach(img => {
          img.removeEventListener('load', checkScrollButtons);
        });
      };
    }
    
    return () => clearTimeout(timeoutId);
  }, [allImages]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button onClick={() => navigate("/")}>Return Home</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={allImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <div className="relative">
                {canScrollLeft && (
                  <button
                    onClick={() => scrollThumbnails('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background border shadow-md rounded-full p-1.5 transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}
                <div
                  ref={thumbnailRef}
                  className={`flex gap-2 overflow-x-auto scrollbar-hide px-1 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 overflow-hidden rounded-md border-2 transition-all ${
                        selectedImage === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-muted-foreground/30"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                {canScrollRight && (
                  <button
                    onClick={() => scrollThumbnails('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background border shadow-md rounded-full p-1.5 transition-all"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* 360° View */}
            {allImages.length > 1 && (
              <Product360View 
                images={allImages} 
                productName={product.name}
              />
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {product.name}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">{product.brand}</p>
            
            {/* Price */}
            <p className="text-4xl font-bold text-primary mb-8">
              ₹{product.price.toLocaleString()}
            </p>

            <div className="mb-8">
              <h3 className="font-bold text-lg mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Color Options */}
            {product.colorVariants && product.colorVariants.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3">Colors</h3>
                <div className="flex gap-3 flex-wrap">
                  {product.colorVariants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const imageIndex = allImages.findIndex(img => img === variant.image);
                        if (imageIndex !== -1) {
                          setSelectedImage(imageIndex);
                        }
                      }}
                      className="group flex flex-col items-center gap-1"
                      title={variant.name}
                    >
                      <div
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          allImages[selectedImage] === variant.image
                            ? 'border-primary ring-2 ring-primary/20 scale-110'
                            : 'border-border hover:border-primary/50'
                        }`}
                        style={{ backgroundColor: variant.color }}
                      />
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                        {variant.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <SizeGuide />
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  className="flex-1 md:flex-initial"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => toggleWishlist(product.id)}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
              </div>
              
              <div className="pt-6 border-t space-y-2 text-sm text-muted-foreground">
                <p>✓ Free shipping on orders above ₹999</p>
                <p>✓ Easy 30-day returns</p>
                <p>✓ Secure payment options</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Product Specifications & FAQs */}
        <ProductSpecifications product={product} />

        {/* AI-Powered Recommendations */}
        <AIRecommendations currentProduct={product} />
        
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
};

export default ProductDetail;
