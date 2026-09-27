import React from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { ProductsPage } from '../pages/public/ProductsPage';
import { ProductDetailPage } from '../pages/public/ProductDetailPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';

// Customer Pages
import { CartPage } from '../pages/customer/CartPage';
import { CheckoutPage } from '../pages/customer/CheckoutPage';
import { OrderConfirmationPage } from '../pages/customer/OrderConfirmationPage';
import { OrdersPage } from '../pages/customer/OrdersPage';
import { OrderDetailPage } from '../pages/customer/OrderDetailPage';
import { ProfilePage } from '../pages/customer/ProfilePage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminProducts } from '../pages/admin/AdminProducts';
import { AdminInventory } from '../pages/admin/AdminInventory';
import { AdminOrders } from '../pages/admin/AdminOrders';
import { AdminUsers } from '../pages/admin/AdminUsers';

/**
 * Route guard for authenticated customer routes
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner size="lg" message="Verifying authentication session..." className="min-h-[60vh]" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * Route guard for administrator routes
 */
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner size="lg" message="Checking administrator privileges..." className="min-h-[60vh]" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">403 Forbidden: Administrator Access Required</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          You do not possess the required administrator privileges to view or modify this resource.
        </p>
        <Link to="/">
          <Button variant="primary">Return to Storefront</Button>
        </Link>
      </div>
    );
  }

  return children;
};

export const NotFoundPage = () => (
  <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
    <h1 className="text-6xl font-black text-slate-300">404</h1>
    <h2 className="text-2xl font-black text-slate-900">Page Not Found</h2>
    <p className="text-sm text-slate-500 max-w-sm mx-auto">
      The page or catalog item you are looking for has been moved, removed, or never existed.
    </p>
    <Link to="/">
      <Button variant="primary">
        <ArrowLeft className="w-4 h-4 mr-1" /> Return to Homepage
      </Button>
    </Link>
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Storefront Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/cart" element={<CartPage />} />

      {/* Customer Protected Routes */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-confirmation/:id"
        element={
          <ProtectedRoute>
            <OrderConfirmationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminRoute>
            <AdminProducts />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <AdminRoute>
            <AdminInventory />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <AdminOrders />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        }
      />

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
