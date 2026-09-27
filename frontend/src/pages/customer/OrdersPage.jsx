import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, ArrowRight, ShoppingBag, Eye, Clock } from 'lucide-react';
import api from '../../services/api';
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders');
        if (res.success && res.data?.orders) {
          setOrders(res.data.orders);
        }
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your order history..." className="min-h-[50vh]" />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Orders History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review, track status, and inspect past purchases.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Orders Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You haven't placed any orders yet. Discover high-grade gear in our curated catalog!
          </p>
          <Link to="/products">
            <Button variant="primary">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:border-emerald-500/30 hover:shadow-md transition-all space-y-4"
            >
              {/* Order Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-slate-900">
                      {order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Placed on{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Order Total</span>
                    <span className="text-lg font-black text-slate-900">
                      ${order.totalAmount?.toFixed(2)}
                    </span>
                  </div>

                  <Link to={`/orders/${order.id}`}>
                    <Button variant="secondary" size="sm">
                      <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Items Thumbnails / Summary */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-2.5 text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                    )}
                    <span className="font-semibold truncate max-w-[200px]">{item.productName}</span>
                    <span className="text-slate-400 font-bold">×{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
