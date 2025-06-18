import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import HomePage from "@/pages/HomePage";
import StorefrontPage from "@/pages/StorefrontPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import WishlistPage from "@/pages/WishlistPage";
import ProfilePage from "@/pages/ProfilePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import CustomerOrdersPage from "@/pages/CustomerOrdersPage";

// Admin Pages
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminOrderTrackingPage from "@/pages/AdminOrderTrackingPage";
import AdminReturnRequestsPage from "@/pages/AdminReturnRequestsPage";
import AdminLogsPage from "@/pages/AdminLogsPage";
import SupportRequestsPage from "@/pages/SupportRequestsPage";
import AdminUsersPage from "@/pages/AdminUsersPage";

// Merchant Pages
import MerchantDashboardPage from "@/pages/MerchantDashboardPage";
import AddOrEditProductPage from "@/pages/AddOrEditProductPage";
import MerchantOrdersPage from "@/pages/MerchantOrdersPage";

// Other Pages
import SearchResultsPage from "@/pages/SearchResultsPage";
import TermsAndConditionsPage from "@/pages/TermsAndConditionsPage";
import HelpCenterPage from "@/pages/HelpCenterPage";
import NotFoundPage from "@/pages/404";

// Analytics
import AnalyticsTracker from "@/components/AnalyticsTracker";

function App() {
  return (
    <Router>
      <AnalyticsTracker />
      <Routes>
        {/* Customer Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/store" element={<StorefrontPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/orders" element={<CustomerOrdersPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Admin Pages */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/track-orders" element={<AdminOrderTrackingPage />} />
        <Route path="/admin/return-requests" element={<AdminReturnRequestsPage />} />
        <Route path="/admin/logs" element={<AdminLogsPage />} />
        <Route path="/admin/support" element={<SupportRequestsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />

        {/* Merchant Pages */}
        <Route path="/merchant" element={<MerchantDashboardPage />} />
        <Route path="/merchant/products" element={<AddOrEditProductPage />} />
        <Route path="/merchant/orders" element={<MerchantOrdersPage />} />

        {/* Other Pages */}
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/terms" element={<TermsAndConditionsPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;