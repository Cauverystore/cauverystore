import { Link } from "react-router-dom";
import { FiAlertTriangle, FiLogOut, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "@/components/AuthProvider";

export default function SuspendedAccount() {
  const { logout } = useAuth();

  return (
    <div className="max-w-xl mx-auto p-6 text-center bg-white rounded-lg shadow mt-10">
      <div className="text-red-600 text-5xl mb-4 mx-auto">
        <FiAlertTriangle />
      </div>
      <h2 className="text-2xl font-bold mb-2">Account Suspended</h2>
      <p className="mb-4 text-gray-700">
        Your account has been suspended due to a violation of our guidelines.
        If you believe this is a mistake, please contact support.
      </p>
      <div className="space-x-4 mt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 border rounded text-green-700 hover:bg-green-100"
        >
          <FiArrowLeft /> Back to Store
        </Link>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
}
