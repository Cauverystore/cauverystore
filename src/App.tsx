import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import HomePage from "./pages/Home";
import LoginPage from './pages/LoginPage';
import SignupPage from "./pages/Signup";
import ProfilePage from './pages/ProfilePage';
import ProductsPage from './pages/ProductsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Reusable role fetcher
  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error.message);
    } else {
      setRole(data?.role || null);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        await fetchUserRole(currentUser.id);
      }

      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user || null;
      setUser(authUser);

      if (authUser) {
        fetchUserRole(authUser.id);
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <span className="text-gray-700 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <Router>
      <Navbar user={user} role={role} />
      <div className="min-h-screen p-4 bg-gray-50 text-gray-800">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />
          <Route path="/profile" element={
            <ProtectedRoute user={user}>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/products" element={<ProductsPage />} />

          {/* Admin Route */}
          <Route path="/admin" element={
            <ProtectedRoute user={user} role={role} allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Merchant Route */}
          <Route path="/merchant" element={
            <ProtectedRoute user={user} role={role} allowedRoles={['merchant']}>
              <MerchantDashboard />
            </ProtectedRoute>
          } />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
