import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export default function ResendInvoiceEmailPage() {
  const { id } = useParams();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('user_email')
      .eq('id', id)
      .single();

    if (error || !data?.user_email) {
      toast.error('Failed to fetch order details.');
    } else {
      setEmail(data.user_email);
    }
  };

  const handleResend = async () => {
    if (!email || !id) return;
    setSending(true);

    try {
      const response = await resend.emails.send({
        from: 'invoices@cauverystore.in',
        to: email,
        subject: `Your Invoice for Order #${id}`,
        html: `<p>Dear customer,</p>
               <p>Your invoice for order <strong>#${id}</strong> is now ready.</p>
               <p><a href="https://www.cauverystore.in/invoice/${id}" target="_blank">Click here to view your invoice</a>.</p>
               <p>Thank you for shopping with us!</p>`,
      });

      if (response.id) {
        toast.success('Invoice email resent successfully!');
        setSent(true);
      } else {
        throw new Error('No response ID');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to resend invoice email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Resend Invoice Email</h1>

      {email ? (
        <div className="space-y-4">
          <p>
            Invoice will be sent to: <span className="font-semibold">{email}</span>
          </p>
          <button
            onClick={handleResend}
            disabled={sending || sent}
            className={`px-6 py-2 rounded text-white ${
              sent
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {sending ? 'Sending...' : sent ? 'Sent ✅' : 'Resend Invoice'}
          </button>
        </div>
      ) : (
        <p>Loading order details...</p>
      )}
    </div>
  );
}
