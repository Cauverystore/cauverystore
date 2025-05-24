import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Header from "./Components/Header";
import Footer from "./Components/Footer";

import Home from "./Pages/Home";
import Cart from "./Pages/Cart";
import ProductDetail from "./Pages/ProductDetail";
import Checkout from "./Pages/Checkout";
import Login from "./Pages/Login";
import AdminOrders from "./Pages/AdminOrders";
import MerchantDashboard from "./Pages/MerchantDashboard";
import NotFound from "./Pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Navbar />
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />

        {/* 🔐 Admin Protected Route */}
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminOrders />
            </ProtectedRoute>
          }
        />

        {/* 🔐 Merchant Protected Route */}
        <Route
          path="/merchant/dashboard"
          element={
            <ProtectedRoute allowedRoles={["merchant"]}>
              <MerchantDashboard />
            </ProtectedRoute>
          }
        />

        {/* ❌ Catch-all 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
