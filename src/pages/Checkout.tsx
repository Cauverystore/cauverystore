// src/pages/CheckoutPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useCartStore } from '@/stores/useCartStore';
import PageHeader from '@/components/ui/PageHeader';
import FormField from '@/components/ui/FormField';
import LabeledInput from '@/components/ui/LabeledInput';
import InputError from '@/components/ui/InputError';
import LoadingButton from '@/components/ui/LoadingButton';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCartStore();

  const [form, setForm] = useState({
    fullName: '',
    address: '',
    phone: '',
    paymentMethod: 'cod',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    return errs;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error('You must be logged in to place an order');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from('orders').insert([
        {
          user_id: user.id,
          items: cartItems,
          shipping_address: form.address,
          total_price: cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
          payment_method: form.paymentMethod,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      toast.success('Order placed successfully!');
      clearCart();
      navigate('/checkout/success');
    } catch (err) {
      toast.error('Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Helmet>
        <title>Checkout | Cauvery Store</title>
        <meta
          name="description"
          content="Complete your purchase with secure checkout at Cauvery Store."
        />
      </Helmet>

      <PageHeader title="Checkout" />

      <div className="space-y-4">
        <FormField label="Full Name">
          <LabeledInput
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Enter your name"
          />
          <InputError message={errors.fullName} />
        </FormField>

        <FormField label="Address">
          <LabeledInput
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Shipping address"
          />
          <InputError message={errors.address} />
        </FormField>

        <FormField label="Phone Number">
          <LabeledInput
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone number"
          />
          <InputError message={errors.phone} />
        </FormField>

        <FormField label="Payment Method">
          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full dark:bg-gray-800 dark:text-white"
          >
            <option value="cod">Cash on Delivery</option>
            <option value="upi">UPI</option>
            <option value="card">Credit/Debit Card</option>
          </select>
        </FormField>

        <LoadingButton
          loading={loading}
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Place Order
        </LoadingButton>
      </div>
    </div>
  );
}
