import React from 'react';
import { Filter, RotateCcw, Check, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

export const ProductFilter = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  minPrice,
  maxPrice,
  onPriceChange,
  inStockOnly,
  onToggleInStock,
  sortBy,
  onSortChange,
  onResetFilters,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filter Products</span>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors font-medium"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Sort Option (Mobile/Sidebar view) */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        >
          <option value="newest">✨ Newest Arrivals</option>
          <option value="price_asc">💵 Price: Low to High</option>
          <option value="price_desc">💎 Price: High to Low</option>
          <option value="name_asc">🔤 Name: A to Z</option>
          <option value="name_desc">🔤 Name: Z to A</option>
        </select>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
          Categories
        </label>
        <div className="space-y-1">
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === 'all' || !selectedCategory
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>All Categories</span>
            {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug || cat.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.slug || selectedCategory === cat.id
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="truncate text-left">{cat.name}</span>
              {cat._count?.products !== undefined && (
                <span className="text-[11px] text-slate-400 font-normal">
                  ({cat._count.products})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
          Price Range ($)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 font-medium block mb-1">Min ($)</span>
            <input
              type="number"
              placeholder="0"
              min="0"
              value={minPrice}
              onChange={(e) => onPriceChange('min', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium block mb-1">Max ($)</span>
            <input
              type="number"
              placeholder="2000"
              min="0"
              value={maxPrice}
              onChange={(e) => onPriceChange('max', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      {/* Availability Filter */}
      <div className="pt-2 border-t border-slate-100">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onToggleInStock(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
          />
          <span className="text-xs font-semibold text-slate-700">In-Stock Items Only</span>
        </label>
      </div>
    </div>
  );
};
