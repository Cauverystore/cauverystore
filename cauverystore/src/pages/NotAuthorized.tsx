export default function NotAuthorized() {
  return (
    <div className="p-6 text-center max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-red-600 mb-4">🚫 Access Denied</h1>
      <p className="text-gray-700 mb-2">
        You do not have permission to view this page.
      </p>
      <p className="text-sm text-gray-500">
        Please contact an admin if you believe this is a mistake.
      </p>
    </div>
  );
}
