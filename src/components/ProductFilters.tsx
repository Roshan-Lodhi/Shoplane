import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Product } from "@/types/product";

interface ProductFiltersProps {
  products: Product[];
  onFiltersChange: (filters: FilterState) => void;
  externalFilters?: FilterState;
}

export interface FilterState {
  search: string;
  categories: string[];
  brands: string[];
  genders: string[];
  priceRange: [number, number];
}

const ProductFilters = ({ products, onFiltersChange, externalFilters }: ProductFiltersProps) => {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [isOpen, setIsOpen] = useState(false);

  // Sync with external filters (from hash navigation)
  useEffect(() => {
    if (externalFilters) {
      setSearch(externalFilters.search);
      setSelectedCategories(externalFilters.categories);
      setSelectedBrands(externalFilters.brands);
      setSelectedGenders(externalFilters.genders);
      setPriceRange(externalFilters.priceRange);
    }
  }, [externalFilters]);

  // Calculate available brands, categories, and genders with counts
  const { brands, categories, genders, maxPrice } = useMemo(() => {
    const brandMap = new Map<string, number>();
    const categoryMap = new Map<string, number>();
    const genderMap = new Map<string, number>();
    let max = 0;

    products.forEach((product) => {
      brandMap.set(product.brand, (brandMap.get(product.brand) || 0) + 1);
      
      // Use the new category field
      const categoryLabel = product.category.charAt(0).toUpperCase() + product.category.slice(1);
      categoryMap.set(categoryLabel, (categoryMap.get(categoryLabel) || 0) + 1);
      
      // Gender
      const genderLabel = product.gender.charAt(0).toUpperCase() + product.gender.slice(1);
      genderMap.set(genderLabel, (genderMap.get(genderLabel) || 0) + 1);
      
      if (product.price > max) max = product.price;
    });

    return {
      brands: Array.from(brandMap.entries()).map(([name, count]) => ({ name, count })),
      categories: Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count })),
      genders: Array.from(genderMap.entries()).map(([name, count]) => ({ name, count })),
      maxPrice: Math.ceil(max / 1000) * 1000,
    };
  }, [products]);

  // Update price range max if needed
  useMemo(() => {
    if (priceRange[1] < maxPrice) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice, priceRange]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFiltersChange({
      search: value,
      categories: selectedCategories,
      brands: selectedBrands,
      genders: selectedGenders,
      priceRange,
    });
  };

  const handleCategoryToggle = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(updated);
    onFiltersChange({
      search,
      categories: updated,
      brands: selectedBrands,
      genders: selectedGenders,
      priceRange,
    });
  };

  const handleBrandToggle = (brand: string) => {
    const updated = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(updated);
    onFiltersChange({
      search,
      categories: selectedCategories,
      brands: updated,
      genders: selectedGenders,
      priceRange,
    });
  };

  const handleGenderToggle = (gender: string) => {
    const updated = selectedGenders.includes(gender)
      ? selectedGenders.filter((g) => g !== gender)
      : [...selectedGenders, gender];
    setSelectedGenders(updated);
    onFiltersChange({
      search,
      categories: selectedCategories,
      brands: selectedBrands,
      genders: updated,
      priceRange,
    });
  };

  const handlePriceChange = (value: number[]) => {
    const range: [number, number] = [value[0], value[1]];
    setPriceRange(range);
    onFiltersChange({
      search,
      categories: selectedCategories,
      brands: selectedBrands,
      genders: selectedGenders,
      priceRange: range,
    });
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedGenders([]);
    setPriceRange([0, maxPrice]);
    onFiltersChange({
      search: "",
      categories: [],
      brands: [],
      genders: [],
      priceRange: [0, maxPrice],
    });
  };

  const hasActiveFilters =
    search || 
    selectedCategories.length > 0 || 
    selectedBrands.length > 0 || 
    selectedGenders.length > 0 || 
    priceRange[0] > 0 || 
    priceRange[1] < maxPrice;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <Label className="text-base font-semibold mb-4 block">
          Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
        </Label>
        <Slider
          min={0}
          max={maxPrice}
          step={100}
          value={priceRange}
          onValueChange={handlePriceChange}
          className="mt-2"
        />
      </div>

      {/* Gender */}
      <div>
        <Label className="text-base font-semibold mb-4 block">Gender</Label>
        <div className="space-y-3">
          {genders.map(({ name, count }) => (
            <div key={name} className="flex items-center space-x-2">
              <Checkbox
                id={`gender-${name}`}
                checked={selectedGenders.includes(name)}
                onCheckedChange={() => handleGenderToggle(name)}
              />
              <label
                htmlFor={`gender-${name}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
              >
                {name} <span className="text-muted-foreground">({count})</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <Label className="text-base font-semibold mb-4 block">Category</Label>
        <div className="space-y-3">
          {categories.map(({ name, count }) => (
            <div key={name} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${name}`}
                checked={selectedCategories.includes(name)}
                onCheckedChange={() => handleCategoryToggle(name)}
              />
              <label
                htmlFor={`category-${name}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
              >
                {name} <span className="text-muted-foreground">({count})</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <Label className="text-base font-semibold mb-4 block">Brand</Label>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {brands.map(({ name, count }) => (
            <div key={name} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${name}`}
                checked={selectedBrands.includes(name)}
                onCheckedChange={() => handleBrandToggle(name)}
              />
              <label
                htmlFor={`brand-${name}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
              >
                {name} <span className="text-muted-foreground">({count})</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={handleClearFilters}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters {hasActiveFilters && `(${selectedCategories.length + selectedBrands.length + selectedGenders.length})`}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Refine your product search
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ProductFilters;
