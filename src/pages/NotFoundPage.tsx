import { useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const NotFoundPage = () => {
  useEffect(() => {
    toast.error("Page not found.");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow p-8 rounded text-center max-w-md">
        <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
        <p className="text-lg text-gray-700 mb-6">
          Sorry, the page you are looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
