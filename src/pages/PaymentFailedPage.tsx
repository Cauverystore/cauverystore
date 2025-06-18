import { Link } from 'react-router-dom';

export default function PaymentFailedPage() {
  return (
    <div className="max-w-xl mx-auto p-6 text-center bg-white dark:bg-gray-900 shadow rounded">
      <h1 className="text-3xl font-bold text-red-600 mb-4">❌ Payment Failed</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
        Something went wrong while processing your payment.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          to="/checkout"
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
        >
          Retry Payment
        </Link>
        <Link
          to="/"
          className="bg-gray-300 text-black dark:text-white px-6 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-800 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
