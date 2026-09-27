import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  ArrowRight,
  Printer,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import api from '../../services/api';
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        if (res.success && res.data?.order) {
          setOrder(res.data.order);
        } else {
          setError('Order details not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve order confirmation');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your order receipt..." className="min-h-[50vh]" />;
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Order Confirmation</h2>
        <p className="text-sm text-slate-500">{error || 'Order could not be found'}</p>
        <Link to="/orders">
          <Button variant="primary">View My Orders</Button>
        </Link>
      </div>
    );
  }

  const shipping = order.shippingAddress || {};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Success Hero Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/30 animate-in zoom-in">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Order Placed Successfully!
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Thank you for shopping with ShopNexus. We've registered your order and your items are being prepared for fulfillment.
        </p>
      </div>

      {/* Main Order Receipt Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Receipt Top Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-1">
              Order Confirmation Tracking Number
            </span>
            <span className="text-xl sm:text-2xl font-mono font-bold">{order.orderNumber}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-slate-100 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Order Placed
            </span>
            <p className="font-bold text-slate-900 text-sm">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" /> Payment Method
            </span>
            <p className="font-bold text-slate-900 text-sm capitalize">
              {order.paymentMethod === 'CARD' ? 'Credit/Debit Card' : order.paymentMethod === 'UPI' ? 'UPI Instant Payment' : 'Cash on Delivery'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Ship To
            </span>
            <p className="font-bold text-slate-900 text-sm">{shipping.fullName || 'Valued Customer'}</p>
            <p className="text-slate-500 truncate">{shipping.address}, {shipping.city}</p>
          </div>
        </div>

        {/* Order Items List */}
        <div className="p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Purchased Products ({order.items?.length || 0})
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {item.productImage && (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200"
                    />
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.productName}</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      SKU: {item.productSku || 'N/A'} | Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                <span className="text-sm font-bold text-slate-900">
                  ${item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">${order.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span className="font-bold text-slate-900">
                {order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee?.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Sales Tax</span>
              <span className="font-bold text-slate-900">${order.tax?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 text-sm">
              <span className="font-black text-slate-900">Total Charged</span>
              <span className="text-xl font-black text-slate-900">${order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link to="/orders">
          <Button variant="primary" size="lg">
            <span>View in My Orders</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
        <Link to="/products">
          <Button variant="secondary" size="lg">
            <ShoppingBag className="w-4 h-4 mr-1" /> Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};
