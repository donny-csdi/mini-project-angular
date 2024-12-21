import { createReducer, on } from '@ngrx/store';
import { CartState } from './cart.model';
import * as CartActions from './cart.actions';

const CART_STORAGE_KEY = 'cart_state';

// Helper function to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';

// Helper function to save state to session storage
const saveStateToStorage = (state: CartState): CartState => {
  if (isBrowser) {
    window.sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  }
  return state;
};

// Get initial state from session storage or use default
const getInitialState = (): CartState => {
  if (isBrowser) {
    const savedState = window.sessionStorage.getItem(CART_STORAGE_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
  }
  return {
    items: [],
    loading: false,
    error: null
  };
};

export const initialState: CartState = getInitialState();

export const cartReducer = createReducer(
  initialState,
  on(CartActions.addToCart, (state, { item }) => {
    const existingItem = state.items.find(i => i.id === item.id);
    if (existingItem) {
      const newState = {
        ...state,
        items: state.items.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      };
      return saveStateToStorage(newState);
    }
    const newState = {
      ...state,
      items: [...state.items, { ...item, quantity: 1 }]
    };
    return saveStateToStorage(newState);
  }),
  on(CartActions.removeFromCart, (state, { itemId }) => {
    const newState = {
      ...state,
      items: state.items.filter(item => item.id !== itemId)
    };
    return saveStateToStorage(newState);
  }),
  on(CartActions.updateQuantity, (state, { itemId, quantity }) => {
    const newState = {
      ...state,
      items: state.items.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      )
    };
    return saveStateToStorage(newState);
  }),
  on(CartActions.clearCart, state => {
    const newState = {
      ...state,
      items: []
    };
    return saveStateToStorage(newState);
  })
);
