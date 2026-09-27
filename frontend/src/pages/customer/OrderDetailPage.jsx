import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  ShieldCheck,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import api from '../../services/api';
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/orders/${id}`);
        if (res.success && res.data?.order) {
          setOrder(res.data.order);
        } else {
          setError('Order details not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading order invoice details..." className="min-h-[50vh]" />;
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{error || 'Access Denied'}</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          You cannot access this order. Either it does not exist or you do not have permission to view it.
        </p>
        <Link to="/orders">
          <Button variant="primary">Return to My Orders</Button>
        </Link>
      </div>
    );
  }

  const shipping = order.shippingAddress || {};

  // Status progress steps
  const orderStages = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStageIndex = orderStages.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Orders
      </Link>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-8 p-6 sm:p-8">
        {/* Header Information */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-mono font-black text-slate-900">{order.orderNumber}</h1>
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Amount</span>
            <span className="text-2xl font-black text-slate-900">${order.totalAmount?.toFixed(2)}</span>
          </div>
        </div>

        {/* Live Order Timeline Progress Tracker */}
        {!isCancelled ? (
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
              Fulfillment & Dispatch Progress
            </h3>
            <div className="grid grid-cols-5 gap-2 text-center">
              {orderStages.map((stage, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = currentStageIndex === idx;

                return (
                  <div key={stage} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                          : 'bg-slate-200 text-slate-500'
                      } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                    >
                      {isPassed ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-semibold capitalize ${
                        isCurrent ? 'text-emerald-700 font-bold' : isPassed ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {stage.toLowerCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>This order has been cancelled and inventory items have been safely returned to stock.</span>
          </div>
        )}

        {/* Shipping & Payment Meta Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Shipping Address */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5 mb-2">
              <MapPin className="w-4 h-4 text-emerald-600" /> Shipping Destination
            </h4>
            <p className="font-bold text-slate-900 text-sm">{shipping.fullName}</p>
            <p className="text-slate-600">{shipping.address}</p>
            <p className="text-slate-600">
              {shipping.city}, {shipping.state} {shipping.postalCode}, {shipping.country}
            </p>
            <p className="text-slate-500 pt-1">Contact: {shipping.phone}</p>
          </div>

          {/* Payment & Invoice */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5 mb-2">
              <CreditCard className="w-4 h-4 text-emerald-600" /> Payment & Billing
            </h4>
            <p className="text-slate-700">
              Method: <strong className="text-slate-900 capitalize">{order.paymentMethod}</strong>
            </p>
            <p className="text-slate-700">
              Payment Status: <strong className="text-slate-900 capitalize">{order.paymentStatus}</strong>
            </p>
            <p className="text-slate-500 pt-1">
              Encrypted SSL verification recorded with transaction ID {order.id.slice(0, 12)}
            </p>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Purchased Line Items
          </h3>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {order.items?.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4 bg-white">
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

                <div className="text-right font-black text-slate-900 text-sm">
                  ${item.subtotal.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="max-w-xs ml-auto space-y-2 pt-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900">${order.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee:</span>
              <span className="font-bold text-slate-900">
                {order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee?.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Sales Tax (8%):</span>
              <span className="font-bold text-slate-900">${order.tax?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-base font-black text-slate-900">
              <span>Grand Total:</span>
              <span>${order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
