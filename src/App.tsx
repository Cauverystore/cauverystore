// App.tsx final clean-up: confirming Storefront removed
// Deployment sanity fix

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "@/Components/AuthProvider";
import Navbar from "@/Components/Navbar"; // ✅ Matches actual folder name

// General Pages
import Home from "@/pages/Home";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ProfilePage from "@/pages/ProfilePage";
import UserProfilePage from "@/pages/UserProfilePage";
import NotAuthorizedPage from "@/pages/NotAuthorizedPage";

// Cart & Checkout
import CartPage from "@/pages/CartPage";
import Checkout from "@/pages/checkout";
import CheckoutSuccess from "@/pages/CheckoutSuccess";

// Customer
import CustomerDashboard from "@/pages/CustomerDashboard";
import CustomerOrdersPage from "@/pages/CustomerOrdersPage";

// Merchant
import MerchantDashboard from "@/pages/MerchantDashboard";
import MerchantOrdersPage from "@/pages/MerchantOrdersPage";
import AddProduct from "@/pages/AddProduct";
import EditProduct from "@/pages/EditProduct";

// Admin
import AdminDashboard from "@/pages/AdminDashboard";
import AdminLogsPage from "@/pages/AdminLogsPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />

        <div className="min-h-screen bg-gray-50 pt-4">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/user/:userId" element={<UserProfilePage />} />
            <Route path="/not-authorized" element={<NotAuthorizedPage />} />

            {/* Cart & Checkout */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout-success" element={<CheckoutSuccess />} />

            {/* Customer */}
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/orders" element={<CustomerOrdersPage />} />

            {/* Merchant */}
            <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
            <Route path="/merchant/orders" element={<MerchantOrdersPage />} />
            <Route path="/merchant/add-product" element={<AddProduct />} />
            <Route path="/merchant/edit-product/:productId" element={<EditProduct />} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/logs" element={<AdminLogsPage />} />
          </Routes>
        </div>

        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;
