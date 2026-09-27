import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Shield, UserCheck, UserX, Calendar, ShoppingBag } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { TableRowSkeleton } from '../../components/common/LoadingSpinner';

export const AdminUsers = () => {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      let query = '';
      if (roleFilter !== 'ALL') query += `?role=${roleFilter}`;
      if (search) query += `${query ? '&' : '?'}search=${encodeURIComponent(search)}`;

      const res = await api.get(`/admin/users${query}`);
      if (res.success && res.data?.users) {
        setUsers(res.data.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      showToast('Failed to load user accounts', 'error');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    if (user.id === currentUser.id) {
      showToast('You cannot modify your own administrator account status.', 'warning');
      return;
    }

    try {
      setActionLoadingId(user.id);
      const res = await api.put(`/admin/users/${user.id}/status`, {
        isActive: !user.isActive,
      });

      if (res.success) {
        showToast(
          `User account ${!user.isActive ? 'activated' : 'deactivated'} successfully`,
          'success'
        );
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: !user.isActive } : u))
        );
      }
    } catch (error) {
      showToast(error.message || 'Failed to update user status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          User Account Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          View registered customer accounts, inspect order counts, and manage access roles safely.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Administrators</option>
            <option value="USER">Customers</option>
          </select>
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by Name or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Lifetime Orders</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-[11px] text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={user.role === 'ADMIN' ? 'purple' : 'default'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {user.phone || <span className="text-slate-300">N/A</span>}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {user._count?.orders || 0} orders
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {user.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="danger">Deactivated</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={actionLoadingId === user.id}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            user.isActive
                              ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
