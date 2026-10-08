import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    _id: string;
    title: string;
    price: number;
    discountPrice?: number;
    thumbnail?: string;
    instructor?: { name: string };
    level?: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    isInCart: (id: string) => boolean;
    getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => set((state) => {
                if (state.items.find((i) => i._id === item._id)) return state;
                return { items: [...state.items, item] };
            }),
            removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i._id !== id) })),
            clearCart: () => set({ items: [] }),
            isInCart: (id) => get().items.some((i) => i._id === id),
            getCartTotal: () => get().items.reduce((total, item) => total + (item.discountPrice ?? item.price), 0),
        }),
        {
            name: 'learnhub-cart',
        }
    )
);
