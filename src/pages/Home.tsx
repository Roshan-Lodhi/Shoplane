import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Package, Truck, ShieldCheck } from "lucide-react";
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import ProductFilters, { FilterState } from "@/components/ProductFilters";
import RecentlyViewed from "@/components/RecentlyViewed";
import { products } from "@/data/products";

const Home = () => {
  const location = useLocation();
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    categories: [],
    brands: [],
    genders: [],
    priceRange: [0, 20000],
  });

  // Handle hash navigation for category and gender filtering
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash === "clothing") {
      setFilters(prev => ({ ...prev, categories: ["Clothing"], genders: [] }));
      setTimeout(() => {
        document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else if (hash === "accessories") {
      setFilters(prev => ({ ...prev, categories: ["Accessories"], genders: [] }));
      setTimeout(() => {
        document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else if (hash === "shoes") {
      setFilters(prev => ({ ...prev, categories: ["Shoes"], genders: [] }));
      setTimeout(() => {
        document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else if (hash === "men") {
      setFilters(prev => ({ ...prev, genders: ["Men"], categories: [] }));
      setTimeout(() => {
        document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else if (hash === "women") {
      setFilters(prev => ({ ...prev, genders: ["Women"], categories: [] }));
      setTimeout(() => {
        document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location.hash]);

  // Filter products based on active filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(searchLower) ||
          product.brand.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter (using new category field)
      if (filters.categories.length > 0) {
        const categoryLabel = product.category.charAt(0).toUpperCase() + product.category.slice(1);
        if (!filters.categories.includes(categoryLabel)) return false;
      }

      // Gender filter
      if (filters.genders.length > 0) {
        const genderLabel = product.gender.charAt(0).toUpperCase() + product.gender.slice(1);
        // Include unisex products when filtering by any gender
        if (!filters.genders.includes(genderLabel) && product.gender !== "unisex") return false;
      }

      // Brand filter
      if (filters.brands.length > 0) {
        if (!filters.brands.includes(product.brand)) return false;
      }

      // Price filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [filters]);

  return (
    <div className="min-h-screen">
      <HeroSlider />

      {/* Features Section */}
      <section className="py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full hero-gradient flex items-center justify-center mb-4">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Free Shipping</h3>
              <p className="text-sm text-muted-foreground">
                On orders above ₹999
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full hero-gradient flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Easy Returns</h3>
              <p className="text-sm text-muted-foreground">
                30-day return policy
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full hero-gradient flex items-center justify-center mb-4">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Secure Payment</h3>
              <p className="text-sm text-muted-foreground">
                100% secure transactions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section with Filters */}
      <section id="products" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Collection
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our latest collection of trendy clothing, stylish shoes, and premium accessories for men and women
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <ProductFilters products={products} onFiltersChange={setFilters} externalFilters={filters} />
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-xl text-muted-foreground mb-4">
                    No products found matching your filters
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search criteria
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <RecentlyViewed />
    </div>
  );
};

export default Home;
