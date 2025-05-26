import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './Pages/Home';
import Cart from './Pages/Cart';
import ProductDetail from './Pages/ProductDetail';
import Checkout from './Pages/Checkout';
import Login from './Pages/Login';
import MerchantDashboard from './Pages/MerchantDashboard';
import AddProduct from './Pages/AddProduct';
import OrderManagement from './Pages/OrderManagement';
import NotFound from './Pages/NotFound';

function App() {
  return (
    <>
      {/* Top navigation and header remain always visible */}
      <Header />
      <Navbar />

      {/* Route definitions */}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />

        {/* Merchant protected routes */}
        <Route 
          path="/merchant/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['merchant']}>
              <MerchantDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/merchant/add-product" 
          element={
            <ProtectedRoute allowedRoles={['merchant']}>
              <AddProduct />
            </ProtectedRoute>
          } 
        />

        {/* Admin protected route */}
        <Route 
          path="/admin/orders" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <OrderManagement />
            </ProtectedRoute>
          } 
        />

        {/* Fallback 404 Not Found route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Footer remains at the bottom on all pages */}
      <Footer />
    </>
  );
}

export default App;
