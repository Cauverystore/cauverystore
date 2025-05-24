import { useEffect } from 'react'
import { useProductStore } from '../store/productStore'

export default function Storefront() {
  const products = useProductStore((state) => state.products)
  const loadProducts = useProductStore((state) => state.loadProducts)

  useEffect(() => {
    loadProducts()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      {products.length > 0 ? (
        products.map((product) => (
          <div key={product.id} className="border rounded-xl p-4 shadow hover:scale-105 transition">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-cover rounded"
            />
            <h2 className="text-lg font-semibold mt-2">{product.name}</h2>
            <p className="text-green-600 font-bold">₹{product.price}</p>
          </div>
        ))
      ) : (
        <p>Loading products...</p>
      )}
    </div>
  )
}
