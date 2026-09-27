import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-sm ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const OrderStatusBadge = ({ status }) => {
  const map = {
    PENDING: { variant: 'warning', label: 'Pending' },
    CONFIRMED: { variant: 'info', label: 'Confirmed' },
    PROCESSING: { variant: 'purple', label: 'Processing' },
    SHIPPED: { variant: 'primary', label: 'Shipped' },
    DELIVERED: { variant: 'success', label: 'Delivered' },
    CANCELLED: { variant: 'danger', label: 'Cancelled' },
  };

  const config = map[status] || { variant: 'default', label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const PaymentStatusBadge = ({ status }) => {
  const map = {
    PAID: { variant: 'success', label: 'Paid' },
    PENDING: { variant: 'warning', label: 'Payment Pending' },
    FAILED: { variant: 'danger', label: 'Payment Failed' },
  };
  const config = map[status] || { variant: 'default', label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const StockBadge = ({ stock }) => {
  if (stock === 0) {
    return <Badge variant="danger">Out of Stock</Badge>;
  }
  if (stock <= 5) {
    return <Badge variant="warning">Only {stock} Left</Badge>;
  }
  return <Badge variant="success">In Stock ({stock})</Badge>;
};
