import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Layouts
// Layouts
import PublicLayout from "./pages/layouts/PublicLayout";
import CustomerLayout from "./pages/layouts/CustomerLayout";
import MerchantLayout from "./pages/layouts/MerchantLayout";
import AdminLayout from "./pages/layouts/AdminLayout";

// Pages - Public
import HomePage from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import StorefrontPage from "./pages/StorefrontPage";
import ProductDetail from "./pages/ProductDetail";
import CategoryLandingPage from "./pages/CategoryLandingPage";

// Pages - Customer
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/Checkout";
import MyOrdersPage from "./pages/MyOrdersPage";
import WishlistPage from "./pages/WishlistPage";
import SupportPage from "./pages/SupportPage";
import UserProfilePage from "./pages/UserProfilePage";

// Pages - Merchant
import ProductUploadPage from "./pages/ProductUploadPage";
import MerchantOrders from "./pages/MerchantOrders";

// Pages - Admin
import AdminDashboard from "./pages/AdminDashboard";
import AdminSupport from "./pages/AdminSupportPage";

// Components
import Spinner from "./components/Spinner";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import ToasterProvider from "./components/ToasterProvider";

// Context / Store
import { useDarkMode } from "./store/darkModeStore";
import { LoadingProvider } from "./context/LoadingContext";

// ✅ Styles
import "./Ecommerce-green-theme.css";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
};

function App() {
  const { dark } = useDarkMode();

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <div className={dark ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"}>
          <ToasterProvider />
          <LoadingProvider>
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/store" element={<StorefrontPage />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/category/:categoryId" element={<CategoryLandingPage />} />
              </Route>

              {/* Customer Routes */}
              <Route
                path="/account"
                element={<ProtectedRoute allowedRoles={["customer"]}><CustomerLayout /></ProtectedRoute>}
              >
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="orders" element={<MyOrdersPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="profile" element={<UserProfilePage />} />
              </Route>

              {/* Merchant Routes */}
              <Route
                path="/merchant"
                element={<ProtectedRoute allowedRoles={["merchant"]}><MerchantLayout /></ProtectedRoute>}
              >
                <Route path="upload" element={<ProductUploadPage />} />
                <Route path="orders" element={<MerchantOrders />} />
              </Route>

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}
              >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="support" element={<AdminSupport />} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </LoadingProvider>
        </div>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
