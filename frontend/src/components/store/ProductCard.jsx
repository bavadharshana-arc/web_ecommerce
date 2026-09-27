import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { StockBadge } from '../common/Badge';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) return;

    setIsAdding(true);
    const res = await addToCart(product.id, 1);
    setIsAdding(false);

    if (res?.success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1800);
    }
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Product Image & Badges */}
      <Link to={`/products/${product.slug || product.id}`} className="relative block overflow-hidden bg-slate-100 aspect-square">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Stock Badge Overlay */}
        <div className="absolute top-3 left-3 z-10">
          <StockBadge stock={product.stock} />
        </div>

        {/* Quick View Floating Action */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-xs font-bold text-slate-900 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Category & SKU */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-semibold text-emerald-700 uppercase tracking-wider text-[10px]">
            {product.category?.name || 'General'}
          </span>
          <span className="text-[11px] font-mono">{product.sku}</span>
        </div>

        {/* Product Title */}
        <Link
          to={`/products/${product.slug || product.id}`}
          className="font-bold text-slate-900 hover:text-emerald-600 transition-colors line-clamp-2 text-sm leading-snug mb-2"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Short Description */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Price</span>
            <span className="text-lg font-black text-slate-900 tracking-tight">
              ${product.price?.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : isAdded
                ? 'bg-emerald-700 text-white shadow-emerald-700/20'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-95'
            }`}
          >
            {isOutOfStock ? (
              'Out of Stock'
            ) : isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : isAdding ? (
              'Adding...'
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
