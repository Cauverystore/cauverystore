// src/pages/PrivacyPolicy.tsx
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";

export default function PrivacyPolicy() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "view_privacy_policy");
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Helmet>
        <title>Privacy Policy | Cauverystore</title>
        <meta
          name="description"
          content="Learn how Cauverystore handles your personal data, cookies, and account information. We respect your privacy."
        />
        <meta property="og:title" content="Privacy Policy | Cauverystore" />
        <meta
          property="og:description"
          content="Understand how Cauverystore collects, stores, and protects your personal information."
        />
        <meta name="twitter:title" content="Privacy Policy | Cauverystore" />
        <meta
          name="twitter:description"
          content="See how we protect your privacy and handle your data at Cauverystore."
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3KRHXGB7JV"></script>
        <script>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){ dataLayer.push(arguments); }
          gtag('js', new Date());
          gtag('config', 'G-3KRHXGB7JV');
        `}</script>
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">
        Cauverystore values your privacy. This policy outlines how we collect, use, and protect your data.
      </p>
      <ul className="list-disc list-inside space-y-2">
        <li>We collect your email and profile data to process orders and manage accounts.</li>
        <li>We use cookies to enhance your browsing experience.</li>
        <li>Your personal information is never sold or shared with third parties without consent.</li>
        <li>You can request to delete or modify your data at any time.</li>
        <li>Our site uses secure protocols (HTTPS) to protect data transmission.</li>
      </ul>
    </div>
  );
}
