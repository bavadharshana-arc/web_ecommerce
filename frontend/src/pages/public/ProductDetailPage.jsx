import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Zap,
  Check,
  Truck,
  Shield,
  RotateCcw,
  ArrowLeft,
  Minus,
  Plus,
  Package,
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { StockBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/products/${id}`);
        if (res.success && res.data?.product) {
          setProduct(res.data.product);
          setQuantity(1);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleQuantityChange = (delta) => {
    if (!product) return;
    const next = quantity + delta;
    if (next >= 1 && next <= product.stock) {
      setQuantity(next);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;

    setAddingToCart(true);
    const res = await addToCart(product.id, quantity);
    setAddingToCart(false);

    if (res?.success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    }
  };

  const handleBuyNow = async () => {
    if (!product || product.stock <= 0) return;

    setAddingToCart(true);
    const res = await addToCart(product.id, quantity);
    setAddingToCart(false);

    if (res?.success) {
      navigate('/checkout');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading product information..." className="min-h-[50vh]" />;
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">{error || 'Product Not Found'}</h2>
        <p className="text-sm text-slate-500">The product you requested could not be loaded or is unavailable.</p>
        <Link to="/products">
          <Button variant="primary">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back to Products Navigation */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Product Image Gallery */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm overflow-hidden flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full max-h-[500px] object-contain rounded-2xl"
          />
        </div>

        {/* Right Column: Pricing, Information & Purchase Panel */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Category, SKU & Stock Badge */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              {product.category?.name || 'Category'}
            </span>
            <span className="text-xs font-mono text-slate-400">SKU: {product.sku}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            {product.name}
          </h1>

          {/* Price & Stock Status */}
          <div className="flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              ${product.price?.toFixed(2)}
            </div>
            <StockBadge stock={product.stock} />
          </div>

          {/* Description */}
          <div className="text-slate-600 text-sm leading-relaxed border-t border-b border-slate-100 py-4">
            {product.description}
          </div>

          {/* Quantity Selector & Stock Constraint */}
          {!isOutOfStock && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 rounded-lg text-slate-600 hover:bg-white disabled:opacity-30 transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="p-2 rounded-lg text-slate-600 hover:bg-white disabled:opacity-30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Max available: <strong className="text-slate-900">{product.stock} units</strong>
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              variant={addedSuccess ? 'primary' : 'primary'}
              size="lg"
              className="w-full text-sm font-bold"
              disabled={isOutOfStock}
              isLoading={addingToCart}
              onClick={handleAddToCart}
            >
              {isOutOfStock ? (
                'Currently Out of Stock'
              ) : addedSuccess ? (
                <>
                  <Check className="w-5 h-5 mr-2" /> Added {quantity} to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" /> Add {quantity > 1 ? `(${quantity})` : ''} to Cart
                </>
              )}
            </Button>

            {!isOutOfStock && (
              <Button
                variant="dark"
                size="lg"
                className="w-full text-sm font-bold"
                onClick={handleBuyNow}
              >
                <Zap className="w-5 h-5 mr-2 text-emerald-400" /> Buy Now with 1-Click
              </Button>
            )}
          </div>

          {/* Value Props & Assurance */}
          <div className="space-y-2.5 pt-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Ships within 24 business hours from central fulfillment hub</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Official 1-Year Manufacturer Warranty included</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-emerald-600" />
              <span>30-Day Hassle-Free Returns & Replacements</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
