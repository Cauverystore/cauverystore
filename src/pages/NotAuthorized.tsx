import { useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const NotAuthorized = () => {
  useEffect(() => {
    toast.error("You are not authorized to view this page.");
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <div className="bg-white shadow-md p-8 rounded text-center max-w-md">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-700 mb-6">
          You don’t have permission to view this page.
        </p>
        <Link
          to="/"
          className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotAuthorized;
