// src/pages/LowStockAlertPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LowStockAlertPage() {
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .lte("stock", 5);

    if (!error && data) setLowStockProducts(data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Low Stock Alerts</h1>
      {lowStockProducts.length > 0 ? (
        <ul className="space-y-3">
          {lowStockProducts.map((product) => (
            <li key={product.id} className="border rounded p-4 bg-white">
              <p><strong>{product.name}</strong></p>
              <p>Stock Remaining: {product.stock}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>All products are sufficiently stocked.</p>
      )}
    </div>
  );
}
