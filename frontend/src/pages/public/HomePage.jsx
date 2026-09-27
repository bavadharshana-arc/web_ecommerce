import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Flame, CheckCircle, PackageCheck, Layers } from 'lucide-react';
import api from '../../services/api';
import { HeroBanner } from '../../components/store/HeroBanner';
import { ProductCard } from '../../components/store/ProductCard';
import { ProductCardSkeleton } from '../../components/common/LoadingSpinner';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/categories'),
        ]);

        if (prodRes.success && prodRes.data?.products) {
          setFeaturedProducts(prodRes.data.products);
        }
        if (catRes.success && catRes.data?.categories) {
          setCategories(catRes.data.categories);
        }
      } catch (error) {
        console.error('Failed to load homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-12">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Categories Showcase Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5" /> Curated Collections
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Browse by Category</h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?categoryId=${cat.slug || cat.id}`}
              className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 aspect-[4/5] flex flex-col justify-end p-4 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Category Background Image */}
              <img
                src={cat.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover object-center opacity-60 group-hover:opacity-75 group-hover:scale-110 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="relative z-10 space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors leading-tight">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-300 font-medium">
                  {cat._count?.products || 0} Products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Products Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Flame className="w-3.5 h-3.5" /> High Demand
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Trending Essentials</h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Callout Banner */}
      <section className="rounded-3xl bg-emerald-700 text-white p-8 sm:p-12 relative overflow-hidden shadow-xl">
        <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            Premium Guarantee
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Crafted for reliability. Shipped worldwide with zero friction.
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Every product in the ShopNexus inventory undergoes rigorous verification. Enjoy instant order dispatch, real-time tracking, and automated inventory sync.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-bold text-sm shadow-md hover:bg-emerald-50 transition-colors"
            >
              <span>Start Shopping Today</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
