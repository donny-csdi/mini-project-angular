import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CartItem } from '../../store/cart/cart.model';
import * as CartSelectors from '../../store/cart/cart.selectors';
import * as CartActions from '../../store/cart/cart.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  cartItems$: Observable<CartItem[]>;
  cartTotal$: Observable<number>;

  constructor(private store: Store, private router: Router) {
    this.cartItems$ = this.store.select(CartSelectors.selectCartItems);
    this.cartTotal$ = this.store.select(CartSelectors.selectCartTotal);
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(itemId);
    } else {
      this.store.dispatch(CartActions.updateQuantity({ itemId, quantity }));
    }
  }

  removeFromCart(itemId: number): void {
    this.store.dispatch(CartActions.removeFromCart({ itemId }));
  }

  clearCart(): void {
    this.store.dispatch(CartActions.clearCart());
  }

  onCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
