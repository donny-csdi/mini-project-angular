import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'pokemon_cart';
  private cartItemsSubject: BehaviorSubject<CartItem[]>;

  constructor() {
    // Initialize cart from session storage or empty array
    const storedCart = sessionStorage.getItem(this.CART_STORAGE_KEY);
    this.cartItemsSubject = new BehaviorSubject<CartItem[]>(
      storedCart ? JSON.parse(storedCart) : []
    );
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItemsSubject.asObservable();
  }

  addToCart(item: CartItem): void {
    const currentCart = this.cartItemsSubject.value;
    const existingItemIndex = currentCart.findIndex(i => i.id === item.id);

    if (existingItemIndex > -1) {
      currentCart[existingItemIndex].quantity += item.quantity;
    } else {
      currentCart.push(item);
    }

    this.updateCart(currentCart);
  }

  removeFromCart(itemId: number): void {
    const currentCart = this.cartItemsSubject.value;
    const updatedCart = currentCart.filter(item => item.id !== itemId);
    this.updateCart(updatedCart);
  }

  updateQuantity(itemId: number, quantity: number): void {
    const currentCart = this.cartItemsSubject.value;
    const itemIndex = currentCart.findIndex(item => item.id === itemId);
    
    if (itemIndex > -1) {
      currentCart[itemIndex].quantity = quantity;
      this.updateCart(currentCart);
    }
  }

  clearCart(): void {
    this.updateCart([]);
  }

  private updateCart(cart: CartItem[]): void {
    sessionStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    this.cartItemsSubject.next(cart);
  }

  getTotalItems(): Observable<number> {
    return new Observable<number>(observer => {
      this.cartItemsSubject.subscribe(items => {
        const total = items.reduce((sum, item) => sum + item.quantity, 0);
        observer.next(total);
      });
    });
  }

  getTotalPrice(): Observable<number> {
    return new Observable<number>(observer => {
      this.cartItemsSubject.subscribe(items => {
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        observer.next(total);
      });
    });
  }
}
