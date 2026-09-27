import React, { useState } from 'react';
import { User, Mail, Phone, Shield, Calendar, CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateProfile(formData);
    setLoading(false);

    if (res.success) {
      showToast('Profile information updated successfully!', 'success');
    } else {
      showToast(res.message || 'Failed to update profile', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Account Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal details, contact numbers, and view account roles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Badge variant={user?.role === 'ADMIN' ? 'purple' : 'primary'}>
              Role: {user?.role}
            </Badge>
            <Badge variant="success">Active Account</Badge>
          </div>

          <div className="border-t border-slate-100 pt-4 text-xs text-slate-400 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-3.5 h-3.5" /> Registered:
              </span>
              <span className="font-semibold text-slate-800">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Shield className="w-3.5 h-3.5" /> Security:
              </span>
              <span className="font-semibold text-emerald-600">JWT Authenticated</span>
            </div>
          </div>
        </div>

        {/* Right Column: Update Details Form */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100">
            Edit Contact Profile
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              icon={User}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address (Read-only)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pl-10 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              icon={Phone}
              placeholder="+1 (555) 000-0000"
            />

            <div className="pt-2">
              <Button type="submit" variant="primary" isLoading={loading}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
