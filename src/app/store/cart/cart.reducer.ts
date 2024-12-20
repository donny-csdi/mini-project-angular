import { createReducer, on } from '@ngrx/store';
import { CartState } from './cart.model';
import * as CartActions from './cart.actions';

export const initialState: CartState = {
  items: [],
  loading: false,
  error: null
};

export const cartReducer = createReducer(
  initialState,
  on(CartActions.addToCart, (state, { item }) => {
    const existingItem = state.items.find(i => i.id === item.id);
    if (existingItem) {
      return {
        ...state,
        items: state.items.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      };
    }
    return {
      ...state,
      items: [...state.items, { ...item, quantity: 1 }]
    };
  }),
  on(CartActions.removeFromCart, (state, { itemId }) => ({
    ...state,
    items: state.items.filter(item => item.id !== itemId)
  })),
  on(CartActions.updateQuantity, (state, { itemId, quantity }) => ({
    ...state,
    items: state.items.map(item =>
      item.id === itemId
        ? { ...item, quantity }
        : item
    )
  })),
  on(CartActions.clearCart, state => ({
    ...state,
    items: []
  }))
);
