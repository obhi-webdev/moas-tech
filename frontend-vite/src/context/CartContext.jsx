"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
const CartContext = createContext(void 0);
const STORAGE_KEY = "vc-tech-cart";
function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setLoaded(true);
    }
  }, []);
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);
  function addToCart(product, quantity = 1) {
    if (product.stock <= 0) return;
    const safeQuantity = Math.max(1, Math.min(quantity, product.stock));
    setItems((current) => {
      const existing = current.find((item) => item._id === product._id);
      if (existing) {
        return current.map(
          (item) => item._id === product._id ? {
            ...item,
            quantity: Math.min(
              item.quantity + safeQuantity,
              item.stock
            )
          } : item
        );
      }
      return [
        ...current,
        {
          ...product,
          quantity: safeQuantity
        }
      ];
    });
  }
  function removeFromCart(productId) {
    setItems(
      (current) => current.filter((item) => item._id !== productId)
    );
  }
  function updateQuantity(productId, quantity) {
    setItems(
      (current) => current.map(
        (item) => item._id === productId ? {
          ...item,
          quantity: Math.max(1, Math.min(quantity, item.stock))
        } : item
      )
    );
  }
  function clearCart() {
    setItems([]);
  }
  function isInCart(productId) {
    return items.some((item) => item._id === productId);
  }
  const cartCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  return <CartContext.Provider
    value={{
      items,
      cartCount,
      subtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isInCart
    }}
  >
      {children}
    </CartContext.Provider>;
}
function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
export {
  CartProvider,
  useCart
};
