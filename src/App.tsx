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

// Lazy-loaded Pages
const StorefrontPage = lazy(() => import('./pages/StorefrontPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage'));
const TermsAndConditionsPage = lazy(() => import('./pages/TermsAndConditionsPage'));
const ThankYouPage = lazy(() => import('./pages/ThankYouPage'));

const MyInvoicesPage = lazy(() => import('./pages/MyInvoicesPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const OrderInvoicePage = lazy(() => import('./pages/OrderInvoicePage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const ReturnRequestPage = lazy(() => import('./pages/ReturnRequestPage'));
const ReturnRequestPageDetail = lazy(() => import('./pages/ReturnRequestPageDetail'));
const SupportRequestPage = lazy(() => import('./pages/SupportRequestPage'));
const ContactSupportPage = lazy(() => import('./pages/ContactSupportPage'));
const ReportProductPage = lazy(() => import('./pages/ReportProductPage'));
const PaymentDetailPage = lazy(() => import('./pages/PaymentDetailPage'));
const SuspendAccount = lazy(() => import('./pages/SuspendAccount'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminLogsPage = lazy(() => import('./pages/admin/AdminLogsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminProductPage = lazy(() => import('./pages/admin/AdminProductPage'));
const AdminProductRequestPage = lazy(() => import('./pages/admin/AdminProductRequestPage'));
const AdminReportPage = lazy(() => import('./pages/admin/AdminReportPage'));
const AdminReviewReportPage = lazy(() => import('./pages/admin/AdminReviewReportPage'));
const AdminReturnPage = lazy(() => import('./pages/admin/AdminReturnPage'));
const AdminReturnPageDetailPage = lazy(() => import('./pages/admin/AdminReturnPageDetailPage'));
const AdminSupportRequestsPage = lazy(() => import('./pages/admin/AdminSupportRequestsPage'));
const AdminSupportRequestPage = lazy(() => import('./pages/admin/AdminSupportRequestPage'));
const AdminInvoicePage = lazy(() => import('./pages/admin/AdminInvoicePage'));
const AdminCategoryManager = lazy(() => import('./pages/admin/AdminCategoryManager'));
const AdminAssignPage = lazy(() => import('./pages/admin/AdminAssignPage'));

const MerchantDashboard = lazy(() => import('./pages/merchant/MerchantDashboard'));
const MerchantOrdersPage = lazy(() => import('./pages/merchant/MerchantOrdersPage'));
const MerchantProductsPage = lazy(() => import('./pages/merchant/MerchantProductsPage'));
const AddProductPage = lazy(() => import('./pages/merchant/AddProductPage'));
const EditProductPage = lazy(() => import('./pages/merchant/EditProductPage'));
const MerchantInvoicesPage = lazy(() => import('./pages/merchant/MerchantInvoicesPage'));

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
                {/* Public Layout */}
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
                  <Route path="/search-results" element={<SearchResultsPage />} />
                  <Route path="/help-center" element={<HelpCenterPage />} />
                  <Route path="/terms" element={<TermsAndConditionsPage />} />
                  <Route path="/thank-you" element={<ThankYouPage />} />
                </Route>

                {/* Customer Layout */}
                <Route element={<CustomerLayout />}>
                  <Route path="/my-invoices" element={<MyInvoicesPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/invoice/:id" element={<OrderInvoicePage />} />
                  <Route path="/track-order" element={<TrackOrderPage />} />
                  <Route path="/return-request" element={<ReturnRequestPage />} />
                  <Route path="/return-requests/:id" element={<ReturnRequestPageDetail />} />
                  <Route path="/support-request" element={<SupportRequestPage />} />
                  <Route path="/contact-support" element={<ContactSupportPage />} />
                  <Route path="/report-product" element={<ReportProductPage />} />
                  <Route path="/payment-detail" element={<PaymentDetailPage />} />
                  <Route path="/suspend-account" element={<SuspendAccount />} />
                </Route>

                {/* Admin Layout */}
                <Route element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/logs" element={<AdminLogsPage />} />
                  <Route path="/admin/orders" element={<AdminOrdersPage />} />
                  <Route path="/admin/products" element={<AdminProductsPage />} />
                  <Route path="/admin/product/:id" element={<AdminProductPage />} />
                  <Route path="/admin/product-requests" element={<AdminProductRequestPage />} />
                  <Route path="/admin/reports" element={<AdminReportPage />} />
                  <Route path="/admin/review-reports" element={<AdminReviewReportPage />} />
                  <Route path="/admin/returns" element={<AdminReturnPage />} />
                  <Route path="/admin/return/:id" element={<AdminReturnPageDetailPage />} />
                  <Route path="/admin/support-requests" element={<AdminSupportRequestsPage />} />
                  <Route path="/admin/support-request/:id" element={<AdminSupportRequestPage />} />
                  <Route path="/admin/invoices" element={<AdminInvoicePage />} />
                  <Route path="/admin/category-manager" element={<AdminCategoryManager />} />
                  <Route path="/admin/assign" element={<AdminAssignPage />} />
                </Route>

                {/* Merchant Layout */}
                <Route element={<ProtectedRoute allowedRoles={['merchant']}><MerchantLayout /></ProtectedRoute>}>
                  <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
                  <Route path="/merchant/orders" element={<MerchantOrdersPage />} />
                  <Route path="/merchant/products" element={<MerchantProductsPage />} />
                  <Route path="/merchant/products/add" element={<AddProductPage />} />
                  <Route path="/merchant/products/edit/:id" element={<EditProductPage />} />
                  <Route path="/merchant/invoices" element={<MerchantInvoicesPage />} />
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
