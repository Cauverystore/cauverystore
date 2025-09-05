// src/App.tsx

import { Routes, Route } from 'react-router-dom';

import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// ✅ Layouts
import PublicLayout from '@/pages/Layouts/PublicLayout';
import CustomerLayout from '@/pages/Layouts/CustomerLayout';
import MerchantLayout from '@/pages/Layouts/MerchantLayout';
import AdminLayout from '@/pages/Layouts/AdminLayout';

// ✅ Pages
import Home from '@/pages/Home';
import LoginPage from '@/pages/LoginPage';
import Signup from '@/pages/Signup';
import NotFound from '@/pages/NotFound';
import CartPage from '@/pages/CartPage';
import Checkout from '@/pages/Checkout';
import WishlistPage from '@/pages/WishlistPage';
import ProductDetail from '@/pages/ProductDetail';
import StorefrontPage from '@/pages/StorefrontPage';
import CustomerSupportPage from '@/pages/CustomerSupportPage';
import TrackOrderPage from '@/pages/TrackOrderPage';
import CancelOrderPage from '@/pages/CancelOrderPage';
import MyOrdersPage from '@/pages/MyOrdersPage';
import UserProfilePage from '@/pages/UserProfilePage';
import ThankYouPage from '@/pages/ThankYouPage';
import PaymentFailedPage from '@/pages/PaymentFailedPage';

// ✅ Merchant Pages
import ProductUploadPage from '@/pages/ProductUploadPage';
import MerchantOrders from '@/pages/MerchantOrders';
import MerchantDashboard from '@/pages/MerchantDashboard';
import MerchantProfilePage from '@/pages/MerchantProfilePage';

// ✅ Admin Pages
import AdminDashboard from '@/pages/AdminDashboard';
import AdminOrders from '@/pages/AdminOrders';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AdminSupportPage from '@/pages/AdminSupportPage';
import AdminBannerManager from '@/pages/AdminBannerManager';
import AdminCategoryManager from '@/pages/AdminCategoryManager';
import AdminFAQManager from '@/pages/AdminFAQManager';
import AdminPayoutManager from '@/pages/AdminPayoutManager';
import AdminSEOManager from '@/pages/AdminSEOManager';
import AdminTestimonialManager from '@/pages/AdminTestimonialManager';
import AdminDownloadLogs from '@/pages/AdminDownloadLogs';
import AdminTestResultsDashboard from '@/pages/AdminTestResultsDashboard';

// ✅ Utilities
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* ✅ Public Pages */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<Signup />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="store" element={<StorefrontPage />} />
          <Route path="thank-you" element={<ThankYouPage />} />
          <Route path="payment-failed" element={<PaymentFailedPage />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route
            path="admin/download-logs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDownloadLogs />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ✅ Customer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route element={<CustomerLayout />}>
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="orders" element={<MyOrdersPage />} />
            <Route path="support" element={<CustomerSupportPage />} />
            <Route path="track-order/:id" element={<TrackOrderPage />} />
            <Route path="cancel-order/:id" element={<CancelOrderPage />} />
            <Route path="profile" element={<UserProfilePage />} />
          </Route>
        </Route>

        {/* ✅ Merchant Routes */}
        <Route element={<ProtectedRoute allowedRoles={['merchant']} />}>
          <Route element={<MerchantLayout />}>
            <Route path="merchant/dashboard" element={<MerchantDashboard />} />
            <Route path="merchant/orders" element={<MerchantOrders />} />
            <Route path="merchant/upload-product" element={<ProductUploadPage />} />
            <Route path="merchant/profile" element={<MerchantProfilePage />} />
          </Route>
        </Route>

        {/* ✅ Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/orders" element={<AdminOrders />} />
            <Route path="admin/users" element={<AdminUsersPage />} />
            <Route path="admin/support" element={<AdminSupportPage />} />
            <Route path="admin/banners" element={<AdminBannerManager />} />
            <Route path="admin/categories" element={<AdminCategoryManager />} />
            <Route path="admin/faqs" element={<AdminFAQManager />} />
            <Route path="admin/payouts" element={<AdminPayoutManager />} />
            <Route path="admin/seo" element={<AdminSEOManager />} />
            <Route path="admin/testimonials" element={<AdminTestimonialManager />} />
            <Route path="admin/test-results" element={<AdminTestResultsDashboard />} />
                      </Route>
        </Route>

        {/* ✅ 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}
