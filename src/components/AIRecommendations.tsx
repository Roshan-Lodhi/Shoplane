import { useState, useEffect } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Product } from "@/types/product";
import { products } from "@/data/products";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface AIRecommendationsProps {
  currentProduct: Product;
}

interface RecommendationResult {
  recommendedProductIds: number[];
  reasoning: string;
  personalizationScore: number;
}

const AIRecommendations = ({ currentProduct }: AIRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [reasoning, setReasoning] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { recentlyViewedIds } = useRecentlyViewed();
  const { cart } = useCart();

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const viewedProducts = recentlyViewedIds
        .map(id => products.find(p => p.id === id))
        .filter(Boolean)
        .slice(0, 10);

      const cartProducts = cart.map(item => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        category: item.category,
        price: item.price
      }));

      const { data, error: fnError } = await supabase.functions.invoke('ai-recommendations', {
        body: {
          currentProduct: {
            id: currentProduct.id,
            name: currentProduct.name,
            brand: currentProduct.brand,
            category: currentProduct.category,
            gender: currentProduct.gender,
            price: currentProduct.price,
            isAccessory: currentProduct.isAccessory
          },
          viewedProducts: viewedProducts.map(p => ({
            id: p?.id,
            name: p?.name,
            brand: p?.brand,
            category: p?.category,
            gender: p?.gender,
            price: p?.price
          })),
          cartItems: cartProducts,
          userPreferences: {
            avgPriceViewed: viewedProducts.reduce((sum, p) => sum + (p?.price || 0), 0) / (viewedProducts.length || 1),
            preferredBrands: [...new Set(viewedProducts.map(p => p?.brand))],
            preferredCategories: [...new Set(viewedProducts.map(p => p?.category))]
          }
        }
      });

      if (fnError) throw fnError;

      const result = data as RecommendationResult;
      const recommendedProducts = result.recommendedProductIds
        .map(id => products.find(p => p.id === id))
        .filter((p): p is Product => p !== undefined && p.id !== currentProduct.id)
        .slice(0, 4);

      if (recommendedProducts.length < 4) {
        const fallbackProducts = products
          .filter(p => 
            p.id !== currentProduct.id && 
            !recommendedProducts.some(r => r.id === p.id) &&
            (p.category === currentProduct.category || p.brand === currentProduct.brand)
          )
          .slice(0, 4 - recommendedProducts.length);
        recommendedProducts.push(...fallbackProducts);
      }

      setRecommendations(recommendedProducts);
      setReasoning(result.reasoning);
      setScore(result.personalizationScore);
    } catch (err) {
      console.error("Error fetching AI recommendations:", err);
      setError("Unable to load personalized recommendations");
      
      // Fallback to basic recommendations
      const fallback = products
        .filter(p => p.id !== currentProduct.id)
        .filter(p => p.brand === currentProduct.brand || p.category === currentProduct.category)
        .slice(0, 4);
      setRecommendations(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [currentProduct.id]);

  if (loading) {
    return (
      <section className="mt-16 pt-16 border-t">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          <h2 className="text-2xl font-bold">AI Recommendations</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="mt-16 pt-16 border-t">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Recommended For You</h2>
          {score > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
              {score}% Match
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchRecommendations}
          className="text-muted-foreground"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {reasoning && !error && (
        <p className="text-sm text-muted-foreground mb-6 italic">
          "{reasoning}"
        </p>
      )}

      {error && (
        <p className="text-sm text-amber-600 mb-6">
          {error} - showing similar products instead
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default AIRecommendations;
