import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ProfilePage from "@/pages/ProfilePage";
import StorefrontPage from "@/pages/StorefrontPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import OrdersPage from "@/pages/OrdersPage";
import AdminDashboard from "@/pages/AdminDashboard";
import MerchantDashboard from "@/pages/MerchantDashboard";
import AddProductPage from "@/pages/AddProductPage";
import EditProductPage from "@/pages/EditProductPage";
import AdminOrdersPage from "@/pages/AdminOrdersPage";
import MerchantOrdersPage from "@/pages/MerchantOrdersPage";
import WishlistPage from "@/pages/WishlistPage";
import NotFoundPage from "@/pages/404";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminUsersPage from "@/pages/AdminUsersPage";
import AdminSupportRequestsPage from "@/pages/AdminSupportRequestsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/store" element={<StorefrontPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/support-requests"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSupportRequestsPage />
            </ProtectedRoute>
          }
        />

        {/* Merchant Routes */}
        <Route
          path="/merchant/dashboard"
          element={
            <ProtectedRoute allowedRoles={["merchant"]}>
              <MerchantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/merchant/orders"
          element={
            <ProtectedRoute allowedRoles={["merchant"]}>
              <MerchantOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/merchant/add-product"
          element={
            <ProtectedRoute allowedRoles={["merchant"]}>
              <AddProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/merchant/edit-product/:id"
          element={
            <ProtectedRoute allowedRoles={["merchant"]}>
              <EditProductPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
