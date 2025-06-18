// src/pages/HelpCenterPage.tsx

import { Helmet } from "react-helmet-async";

export default function HelpCenterPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800">
      <Helmet>
        <title>Help Center | Cauverystore</title>
        <meta
          name="description"
          content="Get help with your Cauverystore orders, payments, returns, and more. Visit our Help Center for FAQs and support."
        />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">Help Center</h1>

      <p className="mb-6">
        Welcome to the Cauverystore Help Center. Find answers to common questions about shopping, orders, payments, returns, and account management.
      </p>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">1. How do I track my order?</h2>
          <p>
            You can track your order from the <strong>Orders</strong> page in your account. Tracking information is updated once the product is shipped.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">2. What is the return policy?</h2>
          <p>
            You can request a return or replacement within 7 days of receiving your product. Please visit the Orders page and choose "Return/Replace" to begin.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">3. How can I contact customer support?</h2>
          <p>
            For any issues, you can submit a request from the <strong>Support</strong> page or email us at <a href="mailto:support@cauverystore.in" className="text-green-600 underline">support@cauverystore.in</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">4. I forgot my password. What should I do?</h2>
          <p>
            Go to the Login page and click on "Forgot Password?" to reset your password via email.
          </p>
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-500">Last updated: June 2025</p>
    </div>
  );
}
