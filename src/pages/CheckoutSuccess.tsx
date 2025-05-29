import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <CheckCircle className="text-green-600 w-16 h-16 mb-4" />
      <h1 className="text-2xl font-bold text-green-700 mb-2">
        Order Placed Successfully!
      </h1>
      <p className="text-gray-600 mb-6">
        Thank you for shopping with us. You can view your order history anytime.
      </p>

      <div className="flex gap-4">
        <Link
          to="/customer/orders"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          View My Orders
        </Link>
        <Link
          to="/"
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
