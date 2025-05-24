import React from "react";

export default function Storefront() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Navbar */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Cauverystore</h1>
          <nav className="space-x-6">
            <a href="#products" className="text-gray-700 hover:text-blue-600">Products</a>
            <a href="#about" className="text-gray-700 hover:text-blue-600">About</a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-100 to-white py-20 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Discover Authentic Indian Crafts</h2>
        <p className="text-gray-600 max-w-xl mx-auto">Handpicked artisan products from across Tamil Nadu, delivered to your doorstep.</p>
      </section>

      {/* Product Grid */}
      <section id="products" className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-semibold mb-10 text-center">Featured Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition">
              <img
                src={`https://via.placeholder.com/400x300?text=Product+${i}`}
                alt={`Product ${i}`}
                className="w-full h-56 object-cover"
              />
              <div className="p-4">
                <h4 className="font-bold text-lg mb-1">Product {i}</h4>
                <p className="text-sm text-gray-600 mb-2">Artisan-crafted product description goes here.</p>
                <span className="text-blue-600 font-semibold">₹{i * 199}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 text-center">
        <p className="text-gray-600">&copy; 2025 Cauverystore. All rights reserved.</p>
      </footer>
    </div>
  );
}
