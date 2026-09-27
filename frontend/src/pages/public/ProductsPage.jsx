import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, PackageX, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { ProductCard } from '../../components/store/ProductCard';
import { ProductFilter } from '../../components/store/ProductFilter';
import { Pagination } from '../../components/store/Pagination';
import { ProductCardSkeleton } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 12,
  });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters state from search params
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('categoryId') || 'all';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const sortBy = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Load categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.success && res.data?.categories) {
          setCategories(res.data.categories);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products whenever search params change
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();

      if (searchQuery) query.append('search', searchQuery);
      if (selectedCategory && selectedCategory !== 'all') query.append('categoryId', selectedCategory);
      if (minPrice) query.append('minPrice', minPrice);
      if (maxPrice) query.append('maxPrice', maxPrice);
      if (inStockOnly) query.append('inStock', 'true');
      if (sortBy) query.append('sort', sortBy);
      query.append('page', currentPage);
      query.append('limit', 12);

      const res = await api.get(`/products?${query.toString()}`);
      if (res.success && res.data) {
        setProducts(res.data.products || []);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, minPrice, maxPrice, inStockOnly, sortBy, currentPage]);

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProducts]);

  // Update query params helper
  const updateFilters = (newParams) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '' || val === 'all' || val === false) {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    // Reset page to 1 on filter changes if page wasn't explicitly updated
    if (!newParams.page) {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const handleSelectCategory = (cat) => {
    updateFilters({ categoryId: cat });
  };

  const handlePriceChange = (type, val) => {
    if (type === 'min') updateFilters({ minPrice: val });
    if (type === 'max') updateFilters({ maxPrice: val });
  };

  const handleToggleInStock = (checked) => {
    updateFilters({ inStock: checked ? 'true' : null });
  };

  const handleSortChange = (sort) => {
    updateFilters({ sort });
  };

  const handlePageChange = (page) => {
    updateFilters({ page });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Mobile Filter Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Explore All Products
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing <span className="font-semibold text-slate-900">{pagination.totalProducts}</span> available products
            {searchQuery && (
              <span>
                {' '}
                for keyword <span className="font-bold text-emerald-600">"{searchQuery}"</span>
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>Filters</span>
          </button>

          {/* Desktop Sort Dropdown */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
            >
              <option value="newest">✨ Newest Arrivals</option>
              <option value="price_asc">💵 Price: Low to High</option>
              <option value="price_desc">💎 Price: High to Low</option>
              <option value="name_asc">🔤 Name: A to Z</option>
              <option value="name_desc">🔤 Name: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-24">
          <ProductFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={handlePriceChange}
            inStockOnly={inStockOnly}
            onToggleInStock={handleToggleInStock}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            onResetFilters={handleResetFilters}
          />
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden overflow-y-auto bg-slate-950/60 backdrop-blur-sm p-4 flex items-center justify-center">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto">
              <ProductFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  handleSelectCategory(cat);
                  setMobileFilterOpen(false);
                }}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onPriceChange={handlePriceChange}
                inStockOnly={inStockOnly}
                onToggleInStock={handleToggleInStock}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                onResetFilters={() => {
                  handleResetFilters();
                  setMobileFilterOpen(false);
                }}
              />
              <div className="pt-4 border-t border-slate-100">
                <Button variant="dark" className="w-full" onClick={() => setMobileFilterOpen(false)}>
                  Apply & Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <PackageX className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No products match your criteria</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Try broadening your search term, resetting category filters, or expanding the price range slider.
              </p>
              <Button variant="primary" size="sm" onClick={handleResetFilters}>
                Reset All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Numbered Pagination */}
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
