import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Package, RefreshCw, Search, Plus, Check } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { StockBadge, Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { LoadingSpinner, TableRowSkeleton } from '../../components/common/LoadingSpinner';

export const AdminInventory = () => {
  const { showToast } = useToast();

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | low | out_of_stock
  const [search, setSearch] = useState('');

  const [selectedItem, setSelectedItem] = useState(null);
  const [restockQty, setRestockQty] = useState('10');
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockLoading, setRestockLoading] = useState(false);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      let query = '';
      if (filter === 'low') query = '?filter=low';
      else if (filter === 'out_of_stock') query = '?filter=out_of_stock';

      if (search) query += `${query ? '&' : '?'}search=${encodeURIComponent(search)}`;

      const res = await api.get(`/admin/inventory${query}`);
      if (res.success && res.data?.inventory) {
        setInventory(res.data.inventory);
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
      showToast('Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter, search, showToast]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleQuickAdd = async (id, incrementBy) => {
    try {
      const res = await api.patch(`/admin/inventory/${id}/stock`, { incrementBy });
      if (res.success) {
        showToast(`Stock incremented by +${incrementBy}`, 'success');
        fetchInventory();
      }
    } catch (error) {
      showToast(error.message || 'Failed to update stock', 'error');
    }
  };

  const handleOpenRestockModal = (item) => {
    setSelectedItem(item);
    setRestockQty('10');
    setIsRestockModalOpen(true);
  };

  const handleConfirmRestock = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setRestockLoading(true);
      const res = await api.patch(`/admin/inventory/${selectedItem.id}/stock`, {
        incrementBy: parseInt(restockQty, 10),
      });

      if (res.success) {
        showToast(`Restocked ${selectedItem.name} with +${restockQty} units!`, 'success');
        setIsRestockModalOpen(false);
        fetchInventory();
      }
    } catch (error) {
      showToast(error.message || 'Restock failed', 'error');
    } finally {
      setRestockLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Inventory & Stock Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor real-time warehouse counts, track low-stock thresholds, and trigger instant restock.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Inventory
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All SKUs' },
            { id: 'low', label: '⚠️ Low Stock (≤ 5)' },
            { id: 'out_of_stock', label: '⛔ Out of Stock (0)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search SKU or Product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Unit Price</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4">Health Status</th>
                <th className="py-3.5 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No inventory records match this filter.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-9 h-9 rounded-xl object-cover bg-slate-100 border border-slate-200"
                        />
                        <span className="font-bold text-slate-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">{item.sku}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.categoryName}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900">${item.price.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">{item.stock}</td>
                    <td className="py-3.5 px-4">
                      <StockBadge stock={item.stock} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleQuickAdd(item.id, 5)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200"
                          title="Add 5 units"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleQuickAdd(item.id, 10)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200"
                          title="Add 10 units"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleOpenRestockModal(item)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-bold text-[11px]"
                        >
                          Custom
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Custom Modal */}
      <Modal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        title={`Restock: ${selectedItem?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmRestock} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
            <p className="font-semibold text-slate-700">SKU: {selectedItem?.sku}</p>
            <p className="text-slate-500">Current Stock: <strong className="text-slate-900">{selectedItem?.stock} units</strong></p>
          </div>

          <Input
            label="Units to Add to Stock"
            type="number"
            min="1"
            value={restockQty}
            onChange={(e) => setRestockQty(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsRestockModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={restockLoading}>
              Confirm Restock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
