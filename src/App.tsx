import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Header from "./Components/Header";
import Footer from "./Components/Footer";

import Home from "./Pages/Home";
import Cart from "./Pages/Cart";
import ProductDetail from "./Pages/ProductDetail";
import Checkout from "./Pages/Checkout";
import AdminOrders from "./Pages/AdminOrders";
import HashPasswordTool from "./Utils/HashPasswordTool"; // ✅ for temporary use

function App() {
  return (
    <>
      <Navbar />
      <Header />

      {/* 🔐 TEMPORARY TOOL TO HASH PASSWORD */}
      <HashPasswordTool />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
