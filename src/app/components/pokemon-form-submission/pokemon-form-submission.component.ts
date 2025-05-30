import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { RealtimeDatabaseService } from '../../services/realtime-database.service';
import { Store } from '@ngrx/store';
import { selectCartItems } from '../../store/cart/cart.selectors';
import { Observable } from 'rxjs';
import { CartItem } from '../../store/cart/cart.model';

interface CountryCode {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
}

@Component({
  selector: 'app-pokemon-form-submission',
  standalone: false,
  templateUrl: './pokemon-form-submission.component.html',
  styleUrls: ['./pokemon-form-submission.component.scss']
})
export class PokemonFormSubmissionComponent implements OnInit {
  @Input() pokemon!: Pokemon;
  @Input() evolutions: Pokemon[] = [];
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  
  submissionForm: FormGroup;
  cartItems$: Observable<CartItem[]>;
  
  constructor(
    private fb: FormBuilder,
    // private realtimeDB: RealtimeDatabaseService,
    private store: Store
  ) {
    this.cartItems$ = this.store.select(selectCartItems);
    
    this.submissionForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Subscribe to cart items to handle form submission with cart data
    this.cartItems$.subscribe(items => {
      console.log('Cart items in checkout:', items);
    });
  }

  onSubmit() {
    if (this.submissionForm.valid) {
      this.cartItems$.subscribe(items => {
        const orderData = {
          ...this.submissionForm.value,
          items: items,
          orderDate: new Date().toISOString(),
          status: 'pending'
        };
        
        // this.realtimeDB.saveOrder(orderData).then(() => {
        //   console.log('Order saved successfully');
        //   // Clear cart and redirect to confirmation page
        //   // TODO: Implement clear cart action
        // });
      });
    }
  }
}
