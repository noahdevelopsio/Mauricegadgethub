import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // product_id + (variant_id ? `-${variant_id}` : '')
  product_id: string;
  variant_id: string | null;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  stock_quantity: number;
}

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isCartOpen: false,
      setCartOpen: (open) => set({ isCartOpen: open }),
      
      addItem: (newItem) =>
        set((state) => {
          const qty = newItem.quantity || 1;
          const existingItemIndex = state.items.findIndex(
            (item) => item.id === newItem.id
          );

          let updatedItems = [...state.items];

          if (existingItemIndex > -1) {
            const existingItem = state.items[existingItemIndex];
            const newQty = Math.min(
              existingItem.quantity + qty,
              existingItem.stock_quantity
            );
            updatedItems[existingItemIndex] = {
              ...existingItem,
              quantity: newQty,
            };
          } else {
            updatedItems.push({
              id: newItem.id,
              product_id: newItem.product_id,
              variant_id: newItem.variant_id,
              name: newItem.name,
              price: newItem.price,
              quantity: Math.min(qty, newItem.stock_quantity),
              image_url: newItem.image_url,
              stock_quantity: newItem.stock_quantity,
            });
          }

          return { items: updatedItems, isCartOpen: true };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock_quantity)) }
              : item
          ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "mgh-cart", // key name for localStorage
    }
  )
);
