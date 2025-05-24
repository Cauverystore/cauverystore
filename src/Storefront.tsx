import React from "react";
import ProductCard from "@/components/Productcard";
import { useProductStore } from "@/store/productStore";

const StorefrontPage = () => {
  const products = useProductStore((state) => state.products);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome to Cauvery Store</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Category Text Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Browse by Categories</h2>
        <div className="space-y-8 text-gray-800">
          {[
            {
              title: "Electronics & Gadgets",
              items: [
                "Electronics",
                "Mobiles",
                "Computers & Accessories",
                "Appliances",
                "Software",
                "Apps & Games",
                "Video Games",
              ],
            },
            {
              title: "Fashion & Accessories",
              items: [
                "Fashion",
                "Clothing & Accessories",
                "Shoes & Handbags",
                "Jewellery",
                "Luggage & Bags",
                "Watches",
              ],
            },
            {
              title: "Home & Living",
              items: [
                "Home & Furniture",
                "Furniture",
                "Home & Kitchen",
                "Garden & Outdoors",
                "Tools & Home Improvement",
              ],
            },
            {
              title: "Beauty & Personal Care",
              items: ["Beauty", "Luxury Beauty", "Health & Personal Care"],
            },
            {
              title: "Books, Music & Entertainment",
              items: ["Books", "MP3 Music", "Music", "Movies & TV Shows"],
            },
            {
              title: "Sports & Hobbies",
              items: [
                "Sports, Fitness & Outdoors",
                "Musical Instruments",
                "Collectibles",
              ],
            },
            {
              title: "Baby & Kids",
              items: ["Baby", "Toys & Games"],
            },
            {
              title: "Automotive & Industrial",
              items: ["Car & Motorbike", "Two Wheelers"],
            },
            {
              title: "Industrial & Scientific",
              items: [],
            },
            {
              title: "Grocery & Gourmet",
              items: ["Grocery & Gourmet Foods"],
            },
            {
              title: "Pet Supplies",
              items: ["Pet Supplies"],
            },
            {
              title: "Office & Stationery",
              items: ["Office Products"],
            },
            {
              title: "Promotions & Services",
              items: ["Deals", "Gift Cards", "Under ₹500", "Flight Bookings"],
            },
            {
              title: "Miscellaneous & Multi-Category",
              items: ["Beauty, Toys & More"],
            },
          ].map((category) => (
            <div key={category.title}>
              <h3 className="bg-red-600 text-white font-semibold px-2 py-1 inline-block rounded">
                {category.title}
              </h3>
              {category.items.length > 0 && (
                <ul className="list-disc list-inside ml-4 mt-2">
                  {category.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StorefrontPage;
