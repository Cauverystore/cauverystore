// src/pages/TermsAndConditionsPage.tsx

import { Helmet } from "react-helmet-async";

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800">
      <Helmet>
        <title>Terms and Conditions | Cauverystore</title>
        <meta
          name="description"
          content="Read the terms and conditions of using Cauverystore. Your access and usage imply agreement to these terms."
        />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">Terms and Conditions</h1>
      <p className="mb-4">
        Welcome to Cauverystore. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions:
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Use of the Site</h2>
      <p className="mb-4">
        You agree to use the site for lawful purposes only and not to engage in any activity that disrupts or interferes with the functioning of the site.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Intellectual Property</h2>
      <p className="mb-4">
        All content, including logos, images, text, and designs, are the property of Cauverystore and may not be reused without permission.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Purchases</h2>
      <p className="mb-4">
        All purchases made through the site are subject to product availability and our return policy.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Account Responsibility</h2>
      <p className="mb-4">
        Users are responsible for maintaining the confidentiality of their account information and passwords.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Changes to Terms</h2>
      <p className="mb-4">
        We reserve the right to update these terms at any time. Continued use of the site implies acceptance of the new terms.
      </p>

      <p className="mt-6 text-sm text-gray-500">
        Last updated: June 2025
      </p>
    </div>
  );
}
