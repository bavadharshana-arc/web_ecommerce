import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Eye,
} from 'lucide-react';
import api from '../../services/api';
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (error) {
        console.error('Failed to load admin dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading administrative metrics..." className="min-h-[50vh]" />;
  }

  const kpis = stats?.kpis || {};
  const statusCounts = stats?.statusCounts || {};
  const recentOrders = stats?.recentOrders || [];
  const categoryDist = stats?.categoryDistribution || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider">
              Control Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time telemetry, revenue analytics, inventory health, and order fulfillment.
          </p>
        </div>

        {/* Quick Admin Actions */}
        <div className="flex items-center gap-3">
          <Link to="/admin/products">
            <Button variant="primary" size="sm">
              <Package className="w-4 h-4 mr-1" /> Manage Products
            </Button>
          </Link>
          <Link to="/admin/orders">
            <Button variant="secondary" size="sm">
              <ShoppingBag className="w-4 h-4 mr-1" /> View Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">${kpis.totalRevenue?.toFixed(2) || '0.00'}</div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Paid & fulfilled volume
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Orders</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.totalOrders || 0}</div>
          <p className="text-[11px] text-slate-400 font-medium">Lifetime transactions</p>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Products</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.totalProducts || 0}</div>
          <p className="text-[11px] text-slate-400 font-medium">Active SKU catalog</p>
        </div>

        {/* Registered Users */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Users</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.totalUsers || 0}</div>
          <p className="text-[11px] text-slate-400 font-medium">Customer accounts</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{kpis.pendingOrders || 0}</div>
          <p className="text-[11px] text-amber-700 font-medium">Needs fulfillment</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Low Stock</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{kpis.lowStockProducts || 0}</div>
          <Link to="/admin/inventory" className="text-[11px] text-rose-600 font-semibold hover:underline block">
            Inspect inventory →
          </Link>
        </div>
      </div>

      {/* Breakdown Section: Order Status Distribution & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Order Status Distribution */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Fulfillment Pipeline Status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {status}
                </span>
                <p className="text-xl font-black text-slate-900">{count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Products by Category</h3>
          <div className="space-y-2.5">
            {categoryDist.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">{cat.name}</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  {cat.productCount} items
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Customer Orders</h3>
            <p className="text-xs text-slate-400">Latest transactions requiring packaging and dispatch</p>
          </div>
          <Link to="/admin/orders">
            <Button variant="secondary" size="sm">
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Order Number</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Order Status</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{order.orderNumber}</td>
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-slate-800">{order.customerName}</p>
                    <p className="text-[11px] text-slate-400">{order.customerEmail}</p>
                  </td>
                  <td className="py-3.5 px-3 font-black text-slate-900">${order.totalAmount.toFixed(2)}</td>
                  <td className="py-3.5 px-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-3.5 px-3">
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <Link to={`/orders/${order.id}`}>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
