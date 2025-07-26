// src/pages/Terms.tsx
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";

export default function Terms() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "view_terms");
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Helmet>
        <title>Terms & Conditions | Cauverystore</title>
        <meta
          name="description"
          content="Read the terms and conditions for using Cauverystore. Learn about our policies, limitations, and responsibilities."
        />
        <meta property="og:title" content="Terms & Conditions | Cauverystore" />
        <meta
          property="og:description"
          content="Understand the terms of service and conditions of use for Cauverystore."
        />
        <meta name="twitter:title" content="Terms & Conditions | Cauverystore" />
        <meta
          name="twitter:description"
          content="Review the terms and usage policies of Cauverystore."
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3KRHXGB7JV"></script>
        <script>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){ dataLayer.push(arguments); }
          gtag('js', new Date());
          gtag('config', 'G-3KRHXGB7JV');
        `}</script>
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">Terms & Conditions</h1>
      <p className="mb-2">
        Welcome to Cauverystore. By using our platform, you agree to the following terms and conditions.
      </p>
      <ul className="list-disc list-inside space-y-1">
        <li>Use of the site is subject to compliance with all applicable laws.</li>
        <li>All content on this site is for informational purposes only.</li>
        <li>We reserve the right to modify or discontinue services at any time.</li>
        <li>All purchases are subject to our return and refund policy.</li>
        <li>Unauthorized use of the website may give rise to a claim for damages.</li>
      </ul>
    </div>
  );
}
