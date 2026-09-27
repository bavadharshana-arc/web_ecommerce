import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Shield, Truck, RotateCcw, Headphones, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      {/* Trust & Guarantee Highlights */}
      <div className="border-b border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-slate-800 text-emerald-400">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Free Express Delivery</h4>
                <p className="text-xs text-slate-400">On all orders over $100</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-slate-800 text-emerald-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Bank-Grade Security</h4>
                <p className="text-xs text-slate-400">256-bit encrypted checkout</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-slate-800 text-emerald-400">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">30-Day Easy Returns</h4>
                <p className="text-xs text-slate-400">Zero hassle money-back policy</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-slate-800 text-emerald-400">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">24/7 Priority Support</h4>
                <p className="text-xs text-slate-400">Direct access to product specialists</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Shop<span className="text-emerald-400">Nexus</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Curating exceptional electronics, computing gear, modern wearables, and ergonomic workspace essentials for forward-thinking professionals.
            </p>
            <div className="text-xs text-slate-500">
              © {new Date().getFullYear()} ShopNexus Inc. All rights reserved. Built with precision.
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Shop Categories</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/products?categoryId=electronics-audio" className="hover:text-emerald-400 transition-colors">
                  Electronics & Audio
                </Link>
              </li>
              <li>
                <Link to="/products?categoryId=laptops-computing" className="hover:text-emerald-400 transition-colors">
                  Laptops & Computing
                </Link>
              </li>
              <li>
                <Link to="/products?categoryId=wearables-smart-devices" className="hover:text-emerald-400 transition-colors">
                  Wearables & Smart
                </Link>
              </li>
              <li>
                <Link to="/products?categoryId=fashion-edc" className="hover:text-emerald-400 transition-colors">
                  Fashion & EDC
                </Link>
              </li>
              <li>
                <Link to="/products?categoryId=home-ergonomics" className="hover:text-emerald-400 transition-colors">
                  Home Ergonomics
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Customer Service</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/orders" className="hover:text-emerald-400 transition-colors">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-emerald-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-emerald-400 transition-colors">
                  Account Settings
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Shipping Policies</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Privacy Statement</span>
              </li>
            </ul>
          </div>

          {/* Development Info & Demo Credentials */}
          <div>
            <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-3">
              Demo Credentials
            </h4>
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/50 text-xs space-y-2 text-slate-300">
              <div>
                <span className="font-semibold text-white block">Admin Account:</span>
                <code className="text-[11px] text-emerald-300">admin@shopnexus.com</code>
                <span className="block text-slate-400">Pass: Admin@123456</span>
              </div>
              <div className="border-t border-slate-700/50 pt-2">
                <span className="font-semibold text-white block">Customer Account:</span>
                <code className="text-[11px] text-sky-300">john@example.com</code>
                <span className="block text-slate-400">Pass: User@123456</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
