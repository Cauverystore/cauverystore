import { useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const AccessDeniedPage = () => {
  useEffect(() => {
    toast.error("Access denied.");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg p-8 rounded text-center max-w-md">
        <h1 className="text-4xl font-bold text-yellow-500 mb-4">403</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          You don't have permission to access this page.
        </p>
        <Link
          to="/"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
