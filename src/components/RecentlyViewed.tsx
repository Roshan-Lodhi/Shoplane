import { products } from "@/data/products";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import ProductCard from "./ProductCard";

const RecentlyViewed = () => {
  const { recentlyViewedIds } = useRecentlyViewed();

  const recentlyViewedProducts = recentlyViewedIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 4);

  if (recentlyViewedProducts.length === 0) return null;

  return (
    <section className="py-16 border-t">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Recently Viewed</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentlyViewedProducts.map((product) => (
            <ProductCard key={product!.id} product={product!} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
