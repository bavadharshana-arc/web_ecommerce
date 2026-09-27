import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const CartPage = () => {
  const { cartItems, cartSummary, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your Shopping Cart is Waiting</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Please log in to your account to view your saved items, synchronize inventory, and proceed to secure checkout.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/login">
            <Button variant="primary">Sign In to Continue</Button>
          </Link>
          <Link to="/products">
            <Button variant="secondary">Browse Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading && cartItems.length === 0) {
    return <LoadingSpinner size="lg" message="Loading shopping cart..." className="min-h-[50vh]" />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your Cart is Currently Empty</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Explore our collection of spatial audio, mechanical keyboards, titanium wearables, and ergonomic workspace essentials.
        </p>
        <div className="pt-2">
          <Link to="/products">
            <Button variant="primary" size="lg">
              <span>Start Exploring Products</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const freeShippingDifference = 100 - cartSummary.subtotal;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Clear Cart */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart ({cartSummary.totalItemsCount} items)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review your items and proceed through our simulated checkout.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 p-2 rounded-xl hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Clear All
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-600 text-white flex-shrink-0">
          <Truck className="w-5 h-5" />
        </div>
        <div className="flex-1">
          {cartSummary.qualifiesForFreeShipping ? (
            <p className="text-xs font-bold text-emerald-900">
              🎉 Congratulations! You have unlocked <span className="underline">FREE Express Delivery</span>!
            </p>
          ) : (
            <p className="text-xs text-emerald-900">
              Add <strong className="font-bold text-emerald-950">${freeShippingDifference.toFixed(2)}</strong> more to qualify for <strong>FREE Express Shipping</strong>!
            </p>
          )}
        </div>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {cartItems.map((item) => {
            const isExceedingStock = item.quantity > item.product.stock;
            const isOutOfStock = item.product.stock <= 0;

            return (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                {/* Product Thumbnail */}
                <Link to={`/products/${item.product.slug || item.product.id}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover object-center"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    {item.product.category?.name || 'Item'}
                  </span>
                  <Link
                    to={`/products/${item.product.slug || item.product.id}`}
                    className="font-bold text-slate-900 hover:text-emerald-600 block text-sm sm:text-base leading-snug"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs font-mono text-slate-400">SKU: {item.product.sku}</p>

                  {/* Stock Warnings */}
                  {isOutOfStock ? (
                    <p className="text-xs text-rose-600 font-bold">This product is currently out of stock.</p>
                  ) : isExceedingStock ? (
                    <p className="text-xs text-amber-600 font-bold">
                      Requested quantity exceeds available inventory ({item.product.stock} available).
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium">${item.product.price?.toFixed(2)} each</p>
                  )}
                </div>

                {/* Quantity Controls & Line Price */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-white disabled:opacity-30 transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-white disabled:opacity-30 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[80px]">
                    <span className="text-base font-black text-slate-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6 sticky top-24">
          <h3 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100">
            Order Breakdown
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">${cartSummary.subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-slate-900">
                {cartSummary.shippingFee === 0 ? (
                  <span className="text-emerald-600 font-bold uppercase text-xs">Free</span>
                ) : (
                  `$${cartSummary.shippingFee.toFixed(2)}`
                )}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Estimated Sales Tax (8%)</span>
              <span className="font-semibold text-slate-900">${cartSummary.tax.toFixed(2)}</span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900">Total Due</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                ${cartSummary.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-lg shadow-emerald-600/20"
            onClick={() => navigate('/checkout')}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>

          <div className="pt-2 text-center">
            <Link
              to="/products"
              className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
            >
              ← Or Continue Browsing Products
            </Link>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Guaranteed 256-bit encrypted checkout with live stock reservation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
