import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Storefront from "@/pages/Storefront";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import CustomerOrdersPage from "@/pages/CustomerOrdersPage";
import MerchantDashboard from "@/pages/MerchantDashboard";
import AdminOrdersPage from "@/pages/AdminOrdersPage";
import AddProduct from "@/pages/AddMerchantProduct";
import EditProduct from "@/pages/EditMerchantProduct";
import Navbar from "@/components/Navbar"; // includes NavCart

function App() {
  return (
    <Router>
      {/* Toast notifications */}
      <Toaster position="top-right" />

      {/* Main Layout */}
      <Navbar />

      <Routes>
        <Route path="/" element={<Storefront />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<CustomerOrdersPage />} />
        <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
        <Route path="/merchant/add-product" element={<AddProduct />} />
        <Route path="/merchant/edit-product/:id" element={<EditProduct />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
      </Routes>
    </Router>
  );
}

export default App;
