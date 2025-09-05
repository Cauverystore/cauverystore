// src/pages/NotFound.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function NotFound() {
  const navigate = useNavigate();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHydrated(true);

    // ✅ GA4: Track 404 exception
    if (window.gtag) {
      window.gtag("event", "exception", {
        description: "Page Not Found (404)",
        fatal: false,
      });
    }
  }, []);

  if (!hydrated) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-6">
      <Helmet>
        <title>404 | Page Not Found - Cauverystore</title>
        <meta
          name="description"
          content="Oops! The page you are looking for was not found on Cauverystore."
        />
        <meta property="og:title" content="404 | Page Not Found - Cauverystore" />
        <meta
          property="og:description"
          content="The page you are trying to visit doesn’t exist. Go back to the homepage to continue shopping."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cauverystore.in/404" />
        <meta property="og:image" content="https://cauverystore.in/og-404.jpg" />
        <meta name="twitter:title" content="404 | Page Not Found - Cauverystore" />
        <meta
          name="twitter:description"
          content="Looks like you got lost. Return to Cauverystore and explore more products."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://cauverystore.in/og-404.jpg" />

        {/* ✅ GA4 script injection */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3KRHXGB7JV"></script>
        <script>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3KRHXGB7JV');
        `}</script>
      </Helmet>

      <div className="max-w-md text-center border border-red-300 p-6 rounded-lg shadow-md bg-red-50 dark:bg-red-100">
        <h1 className="text-2xl font-bold text-red-700 mb-4">404 - Page Not Found</h1>
        <p className="text-gray-700 dark:text-gray-900 mb-4">
          Unfortunately, this page doesn’t exist or has been moved.
        </p>
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={() => navigate("/")}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}
