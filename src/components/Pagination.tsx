import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image_url: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    if (product.quantity <= 0) return;

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
    });

    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col">
      <img
        src={product.image_url}
        alt={product.name}
        className="h-40 object-cover rounded mb-4"
      />
      <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
      <p className="text-green-700 font-bold text-lg mb-2">₹{product.price}</p>

      {product.quantity <= 0 && (
        <p className="text-sm text-red-600 font-medium mb-2">Out of Stock</p>
      )}

      <Button
        onClick={handleAddToCart}
        disabled={product.quantity <= 0}
        className="bg-green-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {product.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  );
}
