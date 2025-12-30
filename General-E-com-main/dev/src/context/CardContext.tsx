// src/context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { useUser } from "./UserContext";
import { cartAPI } from "../utils/api";
import { useCurrency } from "./CurrencyContext";
import { formatCurrency } from "../utils/checkout";

export interface ProductItem {
  id?: string;
  img: string;
  images?: string[];
  name: string;
  price: string; // e.g. "N10000" or formatted string
  priceNumber?: number; // numeric price to support calculations
  button: string;
  sizes?: string[];
  colors?: string[];
  size?: string; // selected size
  color?: string; // selected color
  category?: string;
  description?: string;
  sku?: string;
}

export interface CartProduct extends ProductItem {
  quantity: number;
  cartItemId?: string; // backend cart item id when persisted
}

interface CartContextType {
  cartItems: CartProduct[];
  cartCount: number;
  addToCart: (item: ProductItem) => Promise<void>;
  increaseQty: (itemName: string) => Promise<void>;
  decreaseQty: (itemName: string) => Promise<void>;
  totalPrice: number;
  totalAmount: number;
  clearCart: () => Promise<void>;
  syncing: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [syncing, setSyncing] = useState(false);
  const { user } = useUser();
  const { convertPrice, currency } = useCurrency();

  
  // Map server cart response to CartProduct[]
  const mapServerCart = (cart: any): CartProduct[] => {
    
    if (!cart || !Array.isArray(cart.items)) return [];
    return cart.items.map((it: any) => {
      const prod = it.productId || {};
      // console.log("it",it);
      
      return {
        id: prod._id || prod.id || String(prod),
        img: it.img || (Array.isArray(prod.images) && prod.images[0]) || "https://via.placeholder.com/200x200?text=No+Image",
        images: it.images || (prod.img ? [prod.img] : []),
        name: prod.productName || prod.name || "Product",
        priceNumber: it.price ?? prod.price ?? 0,
        price: formatCurrency(it.price ?? prod.price ?? 0, currency, convertPrice),
        button: "Add to Chart",
        category: prod.category || "all",
        sizes: prod.sizes || [],
        colors: prod.colors || [],
        description: prod.description || "",
        sku: prod.sku || undefined,
        quantity: it.quantity,
        cartItemId: it._id,
      } as CartProduct;
    });
  };

  // Fetch cart from server (for both user and guest)
  const loadCart = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await cartAPI.getCart();
      if (res?.status === 200 && res.data?.success && res.data?.cart) {
        setCartItems(mapServerCart(res.data.cart));
        setSyncing(false);
        return;
      }
    } catch (err: any) {
      console.warn("Failed to load cart", err);
      if (err?.response) {
        console.warn('Server response:', err.response.status, err.response.data);
      }
    }
    // fallback to empty
    setCartItems([]);
    setSyncing(false);
  }, []);

  // On mount and when user changes: load cart
  useEffect(() => {
    loadCart();
  }, [user, loadCart]);

  // Add product to cart (calls API for both guest and authenticated)
  const addToCart = async (item: ProductItem) => {
    if (!item.id) return;
    try {
      await cartAPI.addToCart({ productId: item.id, quantity: 1 });
      await loadCart();
    } catch (err) {
      console.error("Failed to add to cart:", err);
      throw err;
    }
  };

  // Increase quantity
  const increaseQty = async (itemName: string) => {
    const found = cartItems.find((i) => i.name === itemName);
    if (!found) return;

    try {
      if (found.cartItemId) {
        await cartAPI.updateCartItem(found.cartItemId, { quantity: found.quantity + 1 });
      } else {
        // fallback to addToCart which will create or increase
        await cartAPI.addToCart({ productId: found.id!, quantity: 1 });
      }
      await loadCart();
    } catch (err) {
      console.error("Failed to increase quantity:", err);
    }
  };

  // Decrease quantity
  const decreaseQty = async (itemName: string) => {
    const found = cartItems.find((i) => i.name === itemName);
    if (!found) return;

    try {
      if (found.cartItemId) {
        if (found.quantity === 1) {
          await cartAPI.removeFromCart(found.cartItemId);
        } else {
          await cartAPI.updateCartItem(found.cartItemId, { quantity: found.quantity - 1 });
        }
      }
      await loadCart();
    } catch (err) {
      console.error("Failed to decrease quantity:", err);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCartItems([]);
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + convertPrice((item.priceNumber || 0)) * item.quantity, 0);
  const totalAmount = totalPrice; // assuming no additional fees

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      addToCart,
      increaseQty,
      decreaseQty,
      totalPrice,
      totalAmount,
      clearCart,
      syncing
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
