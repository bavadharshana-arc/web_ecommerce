import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { StockBadge, Badge } from '../../components/common/Badge';
import { LoadingSpinner, TableRowSkeleton } from '../../components/common/LoadingSpinner';

export const AdminProducts = () => {
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Active edit / delete item
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form State
  const initialFormState = {
    name: '',
    description: '',
    price: '',
    categoryId: '',
    sku: '',
    stock: '',
    imageUrl: '',
    isActive: true,
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState('');

  // Fetch products and categories
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get(`/products?limit=100${search ? `&search=${encodeURIComponent(search)}` : ''}`),
        api.get('/categories'),
      ]);

      if (prodRes.success && prodRes.data?.products) {
        setProducts(prodRes.data.products);
      }
      if (catRes.success && catRes.data?.categories) {
        setCategories(catRes.data.categories);
        if (catRes.data.categories.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: catRes.data.categories[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      showToast('Failed to load products list', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAddModal = () => {
    setFormData({
      ...initialFormState,
      categoryId: categories[0]?.id || '',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId || categories.find((c) => c.slug === product.category?.slug)?.id || categories[0]?.id,
      sku: product.sku,
      stock: product.stock,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  // Submit Add
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.description || !formData.price || !formData.sku || !formData.imageUrl) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post('/products', {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10) || 0,
      });

      if (res.success) {
        showToast('Product created successfully!', 'success');
        setIsAddModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create product');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Edit
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      setActionLoading(true);
      const res = await api.put(`/products/${selectedProduct.id}`, {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10) || 0,
      });

      if (res.success) {
        showToast('Product updated successfully!', 'success');
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to update product');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Delete
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      setActionLoading(true);
      const res = await api.delete(`/products/${selectedProduct.id}`);
      if (res.success) {
        showToast('Product deleted successfully', 'info');
        setIsDeleteModalOpen(false);
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Product Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Add new catalog items, adjust prices, edit descriptions, and update inventory.
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenAddModal} icon={Plus}>
          Add New Product
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by product name, SKU, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
          {products.length} Products Loaded
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                        />
                        <span className="font-bold text-slate-900 max-w-xs truncate block" title={product.name}>
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 font-semibold">{product.sku}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {product.category?.name || 'General'}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">${product.price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <StockBadge stock={product.stock} />
                    </td>
                    <td className="py-3 px-4">
                      {product.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(product)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Catalog Product"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Nexus Pro Wireless Headphones"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Detailed technical specifications and value propositions..."
                required
              />
            </div>

            <div>
              <Input
                label="Price ($ USD)"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="299.99"
                required
              />
            </div>

            <div>
              <Input
                label="SKU Identifier"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="NEX-AUD-005"
                required
              />
            </div>

            <div>
              <Select
                label="Category"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Input
                label="Available Stock Units"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="50"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Image URL"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={actionLoading}>
              Create Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Product: ${selectedProduct?.name}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdateProduct} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div>
              <Input
                label="Price ($ USD)"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div>
              <Input
                label="SKU Identifier"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>

            <div>
              <Select
                label="Category"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Input
                label="Stock Quantity"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Image URL"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={actionLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action will permanently remove it from the catalog.`}
        confirmText="Delete Product"
        isLoading={actionLoading}
      />
    </div>
  );
};
