"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface CartProduct {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  image?: string;
  price: number;
  regularPrice: number;
  stock: number;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  addToCart: (product: CartProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "moas-tech-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
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

  function addToCart(product: CartProduct, quantity = 1) {
    if (product.stock <= 0) return;

    const safeQuantity = Math.max(1, Math.min(quantity, product.stock));

    setItems((current) => {
      const existing = current.find((item) => item._id === product._id);

      if (existing) {
        return current.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + safeQuantity,
                  item.stock,
                ),
              }
            : item,
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity: safeQuantity,
        },
      ];
    });
  }

  function removeFromCart(productId: string) {
    setItems((current) =>
      current.filter((item) => item._id !== productId),
    );
  }

  function updateQuantity(productId: string, quantity: number) {
    setItems((current) =>
      current.map((item) =>
        item._id === productId
          ? {
              ...item,
              quantity: Math.max(1, Math.min(quantity, item.stock)),
            }
          : item,
      ),
    );
  }

  function clearCart() {
    setItems([]);
  }

  function isInCart(productId: string) {
    return items.some((item) => item._id === productId);
  }

  const cartCount = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
