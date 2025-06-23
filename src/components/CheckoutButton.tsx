import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutButtonProps {
  amount: number;
  orderId: string;
}

export default function CheckoutButton({ amount, orderId }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadRazorpayScript = () =>
    new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject('Failed to load Razorpay script.');
      document.body.appendChild(script);
    });

  const handleCheckout = async () => {
    setLoading(true);

    try {
      await loadRazorpayScript();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to complete checkout.');
        navigate('/login');
        return;
      }

      const user = session.user;
      const userName = user.user_metadata?.full_name || user.email;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_YourTestKeyHere', // fallback test key
        amount: amount * 100, // amount in paise
        currency: 'INR',
        name: 'Cauvery Store',
        description: 'Order Payment',
        handler: async (response: any) => {
          const { razorpay_payment_id } = response;

          const { error } = await supabase
            .from('orders')
            .update({
              status: 'paid',
              payment_id: razorpay_payment_id,
              paid_at: new Date().toISOString(),
            })
            .eq('id', orderId);

          if (error) {
            toast.error('Payment succeeded, but order update failed.');
            return;
          }

          toast.success('Payment successful!');
          navigate('/thank-you');
        },
        prefill: {
          name: userName,
          email: user.email,
        },
        notes: {
          order_id: orderId,
        },
        theme: {
          color: '#10b981', // Tailwind green
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment was cancelled.');
            navigate('/payment-failed');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Checkout failed. Please try again.');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
    >
      {loading ? 'Processing...' : 'Pay Now'}
    </button>
  );
}
