// src/layouts/PublicLayout.tsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PublicLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* 🔔 Announcement Banner */}
      <div className="bg-yellow-200 dark:bg-yellow-600 text-black dark:text-white text-sm text-center py-2">
        🚚 Free shipping on orders over ₹999!
      </div>

      {/* Navbar */}
      <Navbar />

      {/* 🏷 Promo Ribbon */}
      <div className="bg-indigo-600 text-white text-center py-1 text-xs sm:text-sm">
        🎉 Summer Sale: Get 15% off on your first purchase — Use code <strong>WELCOME15</strong>
      </div>

      {/* 🖼 Optional Hero Section on Home Page */}
      {isHomePage && (
        <section className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-700 py-16 px-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">Welcome to CauveryStore</h1>
          <p className="text-md sm:text-lg text-gray-700 dark:text-gray-300">
            Explore the best local products, delivered to your doorstep.
          </p>
        </section>
      )}

      {/* Main Content */}
      <main className="flex-grow pt-10 pb-10 px-4 sm:px-8 md:px-16 lg:px-24">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;
