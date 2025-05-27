// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Store from "@/pages/Store";
import Storefront from "./pages/storefront";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import ProductDetails from "@/pages/ProductDetail";
import AddProduct from "@/pages/AddProduct";
import EditProduct from "@/pages/EditProduct";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminLogsPage from "@/pages/AdminLogsPage";
import UserProfilePage from "@/pages/UserProfilePage";
import MerchantDashboard from "@/pages/MerchantDashboard";
import MerchantOrdersPage from "@/pages/MerchantOrdersPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/NotFound";

import Navbar from "@/Components/Navbar";
import { AuthProvider } from "@/Components/AuthProvider";
import ProtectedRoute from "@/Components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route
            path="/add-product"
            element={
              <ProtectedRoute allowedRoles={["merchant"]}>
                <AddProduct />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-product/:id"
            element={
              <ProtectedRoute allowedRoles={["merchant"]}>
                <EditProduct />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-logs"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLogsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-profile/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/merchant-dashboard"
            element={
              <ProtectedRoute allowedRoles={["merchant"]}>
                <MerchantDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/merchant-orders"
            element={
              <ProtectedRoute allowedRoles={["merchant"]}>
                <MerchantOrdersPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
