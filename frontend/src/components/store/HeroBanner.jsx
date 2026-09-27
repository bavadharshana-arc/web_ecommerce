import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Sparkles, Star } from 'lucide-react';
import { Button } from '../common/Button';

export const HeroBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white shadow-2xl border border-slate-800 my-6">
      {/* Subtle background glow effect */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-14 sm:py-20 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Headline & Call To Action */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Next-Gen Audio & Computing 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            Curated Gear for{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              Peak Performance.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
            Discover spatial audio headphones, mechanical artisan keyboards, titanium biometric wearables, and ergonomic workstations engineered for discerning builders.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
            <Link to="/products">
              <Button variant="primary" size="lg" className="shadow-lg shadow-emerald-500/25">
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/products?categoryId=electronics-audio">
              <Button variant="secondary" size="lg" className="bg-slate-800/80 text-white border-slate-700 hover:bg-slate-700">
                <span>Audio Collection</span>
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="pt-4 flex items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
            <div className="flex -space-x-2">
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" alt="Customer" />
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" alt="Customer" />
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" alt="Customer" />
            </div>
            <div className="flex items-center gap-1">
              <div className="flex text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="font-semibold text-slate-200">4.9/5</span>
              <span>from 1,800+ verified engineers</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Asset */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
              alt="Nexus Pro Spatial Wireless Headphones"
              className="relative rounded-2xl shadow-2xl object-cover w-full max-w-sm sm:max-w-md border border-slate-700/60 transform group-hover:scale-[1.02] transition-transform duration-500"
            />
            {/* Floating Price Tag */}
            <div className="absolute -bottom-4 -left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-xl flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Featured Item</p>
                <p className="text-xs font-bold text-white">Nexus Pro Headphones — $349.99</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
