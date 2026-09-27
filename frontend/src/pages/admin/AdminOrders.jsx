import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Truck,
  MapPin,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/store/Pagination';
import { TableRowSkeleton } from '../../components/common/LoadingSpinner';

export const AdminOrders = () => {
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalOrders: 0 });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        let query = `?page=${page}&limit=10`;
        if (statusFilter !== 'ALL') query += `&status=${statusFilter}`;
        if (search) query += `&search=${encodeURIComponent(search)}`;

        const res = await api.get(`/admin/orders${query}`);
        if (res.success && res.data) {
          setOrders(res.data.orders);
          setPagination(res.data.pagination);
        }
      } catch (error) {
        console.error('Failed to load admin orders:', error);
        showToast('Failed to load orders', 'error');
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, search, showToast]
  );

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.success) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (error) {
      showToast(error.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenDetailModal = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Customer Orders Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Track lifecycle fulfillment, inspect customer shipping information, and update dispatch states.
        </p>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by Order # or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status & Action</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{order.orderNumber}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{order.user?.name || 'Customer'}</p>
                      <p className="text-[11px] text-slate-400">{order.user?.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">${order.totalAmount.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetailModal(order)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="View Full Order Information"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={(page) => fetchOrders(page)}
      />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Order Details: ${selectedOrder.orderNumber}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 block font-semibold uppercase">Customer</span>
                <p className="font-bold text-slate-900 text-sm">{selectedOrder.user?.name}</p>
                <p className="text-slate-500">{selectedOrder.user?.email}</p>
                <p className="text-slate-500">Phone: {selectedOrder.user?.phone || 'N/A'}</p>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold uppercase">Delivery Address</span>
                <p className="font-bold text-slate-900">{selectedOrder.shippingAddress?.fullName}</p>
                <p className="text-slate-600">{selectedOrder.shippingAddress?.address}</p>
                <p className="text-slate-600">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}{' '}
                  {selectedOrder.shippingAddress?.postalCode}
                </p>
                <p className="text-slate-600">{selectedOrder.shippingAddress?.country}</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Line Items</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-2 bg-white">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="py-2.5 px-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      <p className="text-slate-400 font-mono">
                        SKU: {item.productSku || 'N/A'} | Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 text-sm">
              <span className="font-bold text-slate-900">Total Order Amount</span>
              <span className="text-xl font-black text-slate-900">${selectedOrder.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
