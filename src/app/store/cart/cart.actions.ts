import { createAction, props } from '@ngrx/store';
import { CartItem } from './cart.model';

export const addToCart = createAction(
  '[Cart] Add Item',
  props<{ item: CartItem }>()
);

export const removeFromCart = createAction(
  '[Cart] Remove Item',
  props<{ itemId: number }>()
);

export const updateQuantity = createAction(
  '[Cart] Update Quantity',
  props<{ itemId: number; quantity: number }>()
);

export const clearCart = createAction(
  '[Cart] Clear Cart'
);
