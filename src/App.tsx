import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Storefront from './pages/Storefront';
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import CustomerOrdersPage from "@/pages/CustomerOrdersPage";
import MerchantDashboard from "@/pages/MerchantDashboard";
import AdminOrdersPage from "@/pages/AdminOrdersPage";
import AddProduct from "@/pages/AddMerchantProduct";
import EditProduct from "@/pages/EditMerchantProduct";
import Navbar from "@/components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Toaster />
      <Routes>
        <Route path="/" element={<Storefront />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<CustomerOrdersPage />} />
        <Route path="/merchant" element={<MerchantDashboard />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/merchant/add" element={<AddProduct />} />
        <Route path="/merchant/edit/:productId" element={<EditProduct />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
