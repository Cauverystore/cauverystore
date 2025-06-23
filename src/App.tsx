import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import { useDarkMode } from './store/darkModeStore';
import './styles/Ecommerce-green-theme.css';
import Spinner from './components/Spinner';
import ErrorBoundary from './components/ErrorBoundary';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import MerchantLayout from './layouts/MerchantLayout';

// Public Pages
const StorefrontPage = lazy(() => import('./pages/StorefrontPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetail'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/Checkout'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccess'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/Signup'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage'));
const TermsAndConditionsPage = lazy(() => import('./pages/TermsAndConditionsPage'));
const ThankYouPage = lazy(() => import('./pages/ThankYouPage'));

// Customer Pages
const MyInvoicesPage = lazy(() => import('./pages/MyInvoicesPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderInvoicePage = lazy(() => import('./pages/OrderInvoicePage'));
const ReturnRequestPage = lazy(() => import('./pages/ReturnRequestPage'));
const ReturnReplacePage = lazy(() => import('./pages/ReturnReplacePage'));
const ReturnStatusPage = lazy(() => import('./pages/ReturnStatusPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const ContactSupportPage = lazy(() => import('./pages/ContactSupportPage'));
const ReportProductPage = lazy(() => import('./pages/ReportProductPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const SuspendAccount = lazy(() => import('./pages/SuspendedAccount'));

// Merchant Pages
const MerchantDashboard = lazy(() => import('./pages/MerchantDashboard'));
const MerchantOrders = lazy(() => import('./pages/MerchantOrders'));
const MerchantProfilePage = lazy(() => import('./pages/MerchantProfilePage'));
const ProductUploadPage = lazy(() => import('./pages/ProductUploadPage'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminLogsPage = lazy(() => import('./pages/AdminLogsPage'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminProductsPage = lazy(() => import('./pages/AdminProductsPage'));
const AdminReportPage = lazy(() => import('./pages/AdminReportPage'));
const AdminReviewReportsPage = lazy(() => import('./pages/AdminReviewReportsPage'));
const AdminReturnsPage = lazy(() => import('./pages/AdminReturnsPage'));
const AdminReturnRequestsPage = lazy(() => import('./pages/AdminReturnRequestsPage'));
const AdminRepliesPage = lazy(() => import('./pages/AdminRepliesPage'));
const AdminSupportDashboard = lazy(() => import('./pages/AdminSupportDashboard'));
const AdminSupportPage = lazy(() => import('./pages/AdminSupportPage'));
const AdminSupportRequestsPage = lazy(() => import('./pages/AdminSupportRequestsPage'));
const AdminInvoiceRequestsPage = lazy(() => import('./pages/AdminInvoiceRequestsPage'));
const AdminCategoryManager = lazy(() => import('./pages/AdminCategoryManager'));

// Fallback
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const App = () => {
  const { darkMode } = useDarkMode();

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
        <Router>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Suspense fallback={<Spinner />}>
            <ErrorBoundary>
              <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<StorefrontPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/user-profile" element={<UserProfilePage />} />
                  <Route path="/search-results" element={<SearchResultsPage />} />
                  <Route path="/help-center" element={<HelpCenterPage />} />
                  <Route path="/terms" element={<TermsAndConditionsPage />} />
                  <Route path="/thank-you" element={<ThankYouPage />} />
                </Route>

                {/* Customer Routes */}
                <Route element={<CustomerLayout />}>
                  <Route path="/my-invoices" element={<MyInvoicesPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/invoice/:id" element={<OrderInvoicePage />} />
                  <Route path="/return-request" element={<ReturnRequestPage />} />
                  <Route path="/return-replace" element={<ReturnReplacePage />} />
                  <Route path="/return-status/:id" element={<ReturnStatusPage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/contact-support" element={<ContactSupportPage />} />
                  <Route path="/report-product" element={<ReportProductPage />} />
                  <Route path="/track-order" element={<TrackOrderPage />} />
                  <Route path="/suspend-account" element={<SuspendAccount />} />
                </Route>

                {/* Merchant Routes */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={['merchant']}>
                      <MerchantLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
                  <Route path="/merchant/orders" element={<MerchantOrders />} />
                  <Route path="/merchant/profile" element={<MerchantProfilePage />} />
                  <Route path="/merchant/product-upload" element={<ProductUploadPage />} />
                </Route>

                {/* Admin Routes */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/logs" element={<AdminLogsPage />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/products" element={<AdminProductsPage />} />
                  <Route path="/admin/reports" element={<AdminReportPage />} />
                  <Route path="/admin/review-reports" element={<AdminReviewReportsPage />} />
                  <Route path="/admin/returns" element={<AdminReturnsPage />} />
                  <Route path="/admin/return-requests" element={<AdminReturnRequestsPage />} />
                  <Route path="/admin/replies" element={<AdminRepliesPage />} />
                  <Route path="/admin/support-dashboard" element={<AdminSupportDashboard />} />
                  <Route path="/admin/support" element={<AdminSupportPage />} />
                  <Route path="/admin/support-requests" element={<AdminSupportRequestsPage />} />
                  <Route path="/admin/invoice-requests" element={<AdminInvoiceRequestsPage />} />
                  <Route path="/admin/category-manager" element={<AdminCategoryManager />} />
                </Route>

                {/* 404 Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ErrorBoundary>
          </Suspense>
        </Router>
      </div>
    </div>
  );
};

export default App;
