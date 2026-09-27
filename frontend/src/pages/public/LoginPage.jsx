import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, User, ArrowRight, AlertCircle, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      showToast(`Welcome back, ${result.user.name}!`, 'success');
      if (result.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate(redirectPath);
      }
    } else {
      setErrorMessage(result.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-600/30 mb-4">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900">
          Sign In to ShopNexus
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Or{' '}
          <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-500">
            create a new customer account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-slate-200/80 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold"
              isLoading={loading}
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick 1-Click Demo Login Bar */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              1-Click Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@shopnexus.com', 'Admin@123456')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-900 transition-colors text-xs font-semibold"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 mb-1" />
                <span>Fill Admin</span>
                <span className="text-[10px] text-purple-500 font-normal">Full privileges</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('john@example.com', 'User@123456')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors text-xs font-semibold"
              >
                <User className="w-4 h-4 text-slate-600 mb-1" />
                <span>Fill Customer</span>
                <span className="text-[10px] text-slate-500 font-normal">Shopper role</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
