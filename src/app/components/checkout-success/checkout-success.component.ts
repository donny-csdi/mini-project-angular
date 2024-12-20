import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-success',
  templateUrl: './checkout-success.component.html',
  standalone: false,
  styleUrls: ['./checkout-success.component.scss']
})
export class CheckoutSuccessComponent {
  constructor(private router: Router) {}

  continueShopping() {
    this.router.navigate(['/pokemon']);
  }
}
