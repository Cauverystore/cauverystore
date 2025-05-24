import React from "react";

const categories = [
  {
    title: "Electronics & Gadgets",
    items: ["Electronics", "Mobiles", "Computers & Accessories", "Appliances", "Software", "Apps & Games", "Video Games"],
  },
  {
    title: "Fashion & Accessories",
    items: ["Fashion", "Clothing & Accessories", "Shoes & Handbags", "Jewellery", "Luggage & Bags", "Watches"],
  },
  {
    title: "Home & Living",
    items: ["Home & Furniture", "Furniture", "Home & Kitchen", "Garden & Outdoors", "Tools & Home Improvement"],
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
    items: ["Sports, Fitness & Outdoors", "Musical Instruments", "Collectibles"],
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
];

const CategoryList = () => {
  return (
    <section className="px-4 py-10">
      <h2 className="text-2xl font-bold mb-6">Product Categories</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <div key={index} className="border rounded-lg p-4 shadow-sm bg-white">
            <h3 className="text-lg font-semibold text-white bg-green-700 px-2 py-1 inline-block rounded">
              {category.title}
            </h3>
            <ul className="list-disc list-inside mt-2 text-gray-700">
              {category.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryList;
