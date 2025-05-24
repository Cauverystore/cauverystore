import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";

type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity?: number; // make it optional for now
};


type Props = {
  product: Product;
};

export default function Productcard({ product }: Props) {
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <div className="p-4 border">
      <h2>{product.name}</h2>
      <img src={product.image} alt={product.name} />
      <p>${product.price}</p>
      <button onClick={() => addToCart(product)}>Add to Cart</button>
      <button onClick={() => navigate(`/product/${product.id}`)}>
        View Details
      </button>
    </div>
  );
}
