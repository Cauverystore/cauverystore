// src/pages/PaymentFailedPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function PaymentFailedPage() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ✅ GA4: Exception Event
    if ("gtag" in window) {
      window.gtag("event", "exception", {
        description: "Payment Failed",
        fatal: false,
      });

      // ✅ GA4: Custom Purchase Error Event
      window.gtag("event", "purchase_error", {
        error_reason: "payment_failed",
      });
    }

    setAuthChecked(true);
  }, []);

  if (!authChecked) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-6">
      <Helmet>
        <title>Payment Failed | Cauverystore</title>
        <meta
          name="description"
          content="Your payment attempt was unsuccessful. Please try again or use a different payment method."
        />
        <meta property="og:title" content="Payment Failed | Cauverystore" />
        <meta
          property="og:description"
          content="We couldn't process your payment. Please retry or update your payment method."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cauverystore.in/payment-failed" />
        <meta property="og:image" content="https://cauverystore.in/og-payment-failed.jpg" />
        <meta name="twitter:title" content="Payment Failed | Cauverystore" />
        <meta
          name="twitter:description"
          content="Your payment attempt failed. Retry checkout or visit our homepage."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://cauverystore.in/og-payment-failed.jpg" />
      </Helmet>

      <div className="max-w-md text-center border border-red-300 p-6 rounded-lg shadow-md bg-red-50 dark:bg-red-100">
        <h1 className="text-2xl font-bold text-red-700 mb-4">Payment Failed</h1>
        <p className="text-gray-700 dark:text-gray-900 mb-4">
          Unfortunately, your payment could not be processed. Please check your payment method or try again later.
        </p>
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={() => navigate("/account/checkout")}
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
