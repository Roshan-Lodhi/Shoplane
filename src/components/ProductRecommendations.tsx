import { products } from "@/data/products";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

interface ProductRecommendationsProps {
  currentProduct: Product;
}

const ProductRecommendations = ({ currentProduct }: ProductRecommendationsProps) => {
  const recommendations = products
    .filter((p) => {
      if (p.id === currentProduct.id) return false;
      return p.brand === currentProduct.brand || p.isAccessory === currentProduct.isAccessory;
    })
    .slice(0, 4);

  if (recommendations.length === 0) return null;

  return (
    <section className="mt-16 pt-16 border-t">
      <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductRecommendations;
