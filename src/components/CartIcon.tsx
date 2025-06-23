import { Link } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";

const CartIcon = () => {
  const cart = useCartStore((state) => state.cart);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link to="/checkout" className="relative flex items-center hover:text-green-700">
      🛒
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {totalItems}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;
