import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  MapPin,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Truck,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  QrCode,
  DollarSign,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const CheckoutPage = () => {
  const { user } = useAuth();
  const { cartItems, cartSummary, fetchCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+1 (555) 019-2834',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    postalCode: '97477',
    country: 'United States',
  });

  const [paymentMethod, setPaymentMethod] = useState('CARD'); // CARD | UPI | COD
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4242 •••• •••• 4242',
    cardHolder: user?.name || 'John Doe',
    expiry: '12/28',
    cvv: '888',
  });
  const [upiId, setUpiId] = useState('customer@bank');

  useEffect(() => {
    if (user) {
      setShippingDetails((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Your Cart is Empty</h2>
        <p className="text-sm text-slate-500">There are no items in your cart to checkout.</p>
        <Link to="/products">
          <Button variant="primary">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setShippingDetails({ ...shippingDetails, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    if (!shippingDetails.fullName || !shippingDetails.email || !shippingDetails.phone) {
      setErrorMessage('Please fill out all contact details.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const validateStep2 = () => {
    if (!shippingDetails.address || !shippingDetails.city || !shippingDetails.state || !shippingDetails.postalCode || !shippingDetails.country) {
      setErrorMessage('Please complete all shipping address fields.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
    else if (currentStep === 3) setCurrentStep(4);
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const orderPayload = {
        shippingAddress: {
          fullName: shippingDetails.fullName,
          address: shippingDetails.address,
          city: shippingDetails.city,
          state: shippingDetails.state,
          postalCode: shippingDetails.postalCode,
          country: shippingDetails.country,
          phone: shippingDetails.phone,
        },
        paymentMethod,
      };

      const res = await api.post('/orders', orderPayload);

      if (res.success && res.data?.order) {
        showToast('Order placed successfully! Inventory updated.', 'success');
        await fetchCart(); // Refresh cart to empty state
        navigate(`/order-confirmation/${res.data.order.id}`);
      } else {
        setErrorMessage(res.message || 'Failed to place order.');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Error occurred while processing checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout Stepper Progress */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          {[
            { step: 1, label: 'Contact', icon: User },
            { step: 2, label: 'Shipping', icon: MapPin },
            { step: 3, label: 'Payment', icon: CreditCard },
            { step: 4, label: 'Review & Pay', icon: CheckCircle2 },
          ].map((item, idx) => {
            const Icon = item.icon;
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;

            return (
              <React.Fragment key={item.step}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : isCurrent
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 -mt-5 transition-colors ${
                      currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Customer Contact Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900">Step 1: Contact Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">Order confirmation and tracking updates will be sent here.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Full Name"
                    name="fullName"
                    value={shippingDetails.fullName}
                    onChange={handleInputChange}
                    icon={User}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={shippingDetails.email}
                    onChange={handleInputChange}
                    icon={Mail}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={shippingDetails.phone}
                    onChange={handleInputChange}
                    icon={Phone}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button variant="primary" size="lg" onClick={handleNext}>
                  <span>Proceed to Shipping Address</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Shipping Destination */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900">Step 2: Shipping Address</h3>
                <p className="text-xs text-slate-500 mt-0.5">Enter the physical delivery address for your shipment.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Street Address / Suite"
                    name="address"
                    value={shippingDetails.address}
                    onChange={handleInputChange}
                    icon={MapPin}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="City"
                    name="city"
                    value={shippingDetails.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="State / Province"
                    name="state"
                    value={shippingDetails.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Postal / ZIP Code"
                    name="postalCode"
                    value={shippingDetails.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Country"
                    name="country"
                    value={shippingDetails.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button variant="primary" size="lg" onClick={handleNext}>
                  <span>Continue to Payment Method</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method Simulation */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Simulated Sandbox Payment
                </div>
                <h3 className="text-xl font-bold text-slate-900">Step 3: Select Payment Method</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your simulated gateway. In this demo environment, instant mock authorization is executed.
                </p>
              </div>

              {/* Payment Type Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className={`w-6 h-6 mb-2 ${paymentMethod === 'CARD' ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Credit / Debit Card</p>
                    <p className="text-[11px] text-slate-400">Visa, MC, Amex</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className={`w-6 h-6 mb-2 ${paymentMethod === 'UPI' ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Instant UPI / QR</p>
                    <p className="text-[11px] text-slate-400">Google Pay, PhonePe</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <DollarSign className={`w-6 h-6 mb-2 ${paymentMethod === 'COD' ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Cash on Delivery</p>
                    <p className="text-[11px] text-slate-400">Pay upon receipt</p>
                  </div>
                </button>
              </div>

              {/* Dynamic Payment Details */}
              {paymentMethod === 'CARD' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <Input
                    label="Card Number (Demo)"
                    value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                    icon={CreditCard}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry Date"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    />
                    <Input
                      label="Security Code (CVV)"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      icon={Lock}
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <Input
                    label="Virtual Payment Address (VPA / UPI ID)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    icon={QrCode}
                    helperText="Simulated instant payment verification"
                  />
                </div>
              )}

              {paymentMethod === 'COD' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="font-bold">Cash on Delivery selected</p>
                  <p>Your order will be verified and dispatched. Payment will be collected in cash upon delivery.</p>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button variant="primary" size="lg" onClick={handleNext}>
                  <span>Review Final Order</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Final Authorization */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900">Step 4: Final Review & Confirmation</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify shipping address and payment method before placing your order.
                </p>
              </div>

              {/* Review Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold text-slate-900 mb-2">
                    <span>Shipping Destination</span>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-emerald-600 hover:underline text-[11px]"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="font-semibold text-slate-800">{shippingDetails.fullName}</p>
                  <p className="text-slate-600">{shippingDetails.address}</p>
                  <p className="text-slate-600">
                    {shippingDetails.city}, {shippingDetails.state} {shippingDetails.postalCode}
                  </p>
                  <p className="text-slate-600">{shippingDetails.country}</p>
                  <p className="text-slate-500 pt-1">Phone: {shippingDetails.phone}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold text-slate-900 mb-2">
                    <span>Payment Selection</span>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="text-emerald-600 hover:underline text-[11px]"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="font-semibold text-slate-800 capitalize">
                    {paymentMethod === 'CARD' ? '💳 Credit/Debit Card' : paymentMethod === 'UPI' ? '📱 UPI / QR' : '💵 Cash on Delivery'}
                  </p>
                  <p className="text-slate-500">Status: Authorized Sandbox</p>
                </div>
              </div>

              {/* Items in this order */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Products to be Dispatched ({cartItems.length})
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-2 bg-white">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-2.5 px-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{item.product.name}</p>
                          <p className="text-slate-400">Qty: {item.quantity} × ${item.product.price?.toFixed(2)}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setCurrentStep(3)} disabled={loading}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handlePlaceOrder}
                  isLoading={loading}
                  className="font-black px-8 shadow-lg shadow-emerald-600/30"
                >
                  <span>Complete Purchase (${cartSummary.totalAmount.toFixed(2)})</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6 sticky top-24">
          <h3 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100">
            Order Summary
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({cartSummary.totalItemsCount} items)</span>
              <span className="font-semibold text-slate-900">${cartSummary.subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span className="font-semibold text-slate-900">
                {cartSummary.shippingFee === 0 ? (
                  <span className="text-emerald-600 font-bold uppercase text-xs">Free</span>
                ) : (
                  `$${cartSummary.shippingFee.toFixed(2)}`
                )}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Sales Tax (8%)</span>
              <span className="font-semibold text-slate-900">${cartSummary.tax.toFixed(2)}</span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                ${cartSummary.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Database transactions verify real-time inventory and recalculate authoritative totals.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
