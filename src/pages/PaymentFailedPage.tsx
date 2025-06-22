// src/pages/PaymentFailedPage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function PaymentFailedPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Optionally clear cart or log the failure here
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-6">
      <Helmet>
        <title>Payment Failed - Cauverystore</title>
      </Helmet>
      <div className="max-w-md text-center border border-red-300 p-6 rounded-lg shadow-md bg-red-50 dark:bg-red-100">
        <h1 className="text-2xl font-bold text-red-700 mb-4">Payment Failed</h1>
        <p className="text-gray-700 mb-4">
          Unfortunately, your payment could not be processed. Please check your payment method or try again later.
        </p>
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={() => navigate("/checkout")}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
          >
            Retry Payment
          </button>
          <button
            onClick={() => navigate("/")}
            className="text-red-700 hover:underline text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
