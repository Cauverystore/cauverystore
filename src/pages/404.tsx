// src/pages/404.tsx

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col bg-gray-50 px-6 text-center">
      <Helmet>
        <title>404 - Page Not Found | Cauverystore</title>
        <meta
          name="description"
          content="The page you're looking for does not exist on Cauverystore. Return to our homepage or browse our store."
        />
      </Helmet>

      <h1 className="text-6xl font-bold text-green-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="mb-6 text-gray-600">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <Link
        to="/"
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
      >
        Go to Homepage
      </Link>
    </div>
  );
}
