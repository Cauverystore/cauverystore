import React from "react";

const categories = [
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
  // ... (include the rest of your categories here)
];

const CategoryLanding = () => (
  <section className="mt-16">
    <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((cat, index) => (
        <div
          key={index}
          className="border rounded-lg p-4 shadow-sm bg-white"
        >
          <h3 className="text-lg font-bold text-green-800 border-b border-green-300 pb-1 mb-2">
            {cat.title}
          </h3>
          <ul className="list-disc list-inside text-gray-700">
            {cat.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </section>
);

export default CategoryLanding;
