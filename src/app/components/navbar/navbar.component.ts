import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Store } from '@ngrx/store';
import * as CartSelectors from '../../store/cart/cart.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone:false,
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  cartItemsCount$: Observable<number>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private store: Store
  ) {
    this.cartItemsCount$ = this.store.select(CartSelectors.selectCartItemsCount);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
