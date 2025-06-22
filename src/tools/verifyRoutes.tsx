import { Link } from 'react-router-dom';

const routeList = [
  '/',
  '/login',
  '/signup',
  '/cart',
  '/checkout',
  '/checkout-success',
  '/product/1',
  '/store',
  '/search-results',
  '/wishlist',
  '/orders',
  '/invoice/test',
  '/thank-you',
  '/payment-failed',
  '/track-order',
  '/cancel-order',
  '/support',
  '/support-requests',
  '/help-center',
  '/contact-support',
  '/terms-and-conditions',
  '/suspended',
  '/profile',
  '/edit-profile',
  '/user-profile',
  '/report-product',
  '/reported-reviews',
  '/review-replies',
  '/resend-invoice',
  '/return-request',
  '/return-status',
  '/return-replace',
  '/category/test-category',
  '/not-authorized',
  '/my-orders',
  '/my-invoices',
  '/customer/invoice',
  '/customer/orders',
  '/customer/support',
  '/customer/invoice-requests',
  '/merchant/dashboard',
  '/merchant/orders',
  '/merchant/profile',
  '/merchant/edit-product/1',
  '/merchant/add-product',
  '/merchant/low-stock',
  '/merchant/edit-tracking',
  '/admin/dashboard',
  '/admin/users',
  '/admin/user-roles',
  '/admin/support',
  '/admin/support-requests',
  '/admin/analytics',
  '/admin/orders',
  '/admin/replies',
  '/admin/products',
  '/admin/product-reports',
  '/admin/report',
  '/admin/reports',
  '/admin/invoice-request',
  '/admin/logs',
  '/admin/categories',
  '/admin/review-reports',
  '/admin/returns',
  '/admin/return-requests',
  '/admin/track-orders',
];

export default function VerifyRoutes() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">📦 Route Verification</h1>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {routeList.map((path) => (
          <li key={path}>
            <Link
              to={path}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {path}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
