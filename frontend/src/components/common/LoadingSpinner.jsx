import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', className = '', message }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 ${className}`}>
      <Loader2 className={`${sizes[size]} animate-spin text-emerald-600`} />
      {message && <p className="text-sm font-medium text-slate-500">{message}</p>}
    </div>
  );
};

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm animate-pulse flex flex-col h-[380px]">
    <div className="w-full h-48 bg-slate-200 rounded-xl mb-4" />
    <div className="h-3.5 bg-slate-200 rounded-full w-24 mb-2" />
    <div className="h-5 bg-slate-200 rounded-full w-4/5 mb-3" />
    <div className="h-4 bg-slate-200 rounded-full w-1/3 mb-auto" />
    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
      <div className="h-6 bg-slate-200 rounded-full w-20" />
      <div className="h-9 bg-slate-200 rounded-xl w-28" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr className="animate-pulse border-b border-slate-100">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <div className="h-4 bg-slate-200 rounded-full w-4/5" />
      </td>
    ))}
  </tr>
);
