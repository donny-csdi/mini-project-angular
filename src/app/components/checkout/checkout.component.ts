import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectCartItems } from '../../store/cart/cart.selectors';
import { PokemonService } from '../../services/pokemon.service';
import { CartItem } from '../../store/cart/cart.model';
import { Observable, forkJoin, from, of, throwError } from 'rxjs';
import { map, switchMap, catchError, timeout, retry, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { RealtimeDatabaseService } from '../../services/realtime-database.service';
import { clearCart } from '../../store/cart/cart.actions';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';

interface PokemonEvolution {
  species: {
    name: string;
    url: string;
  };
  evolves_to: PokemonEvolution[];
}

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems$: Observable<CartItem[]>;
  pokemonEvolutions: { [key: number]: string[] } = {};
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private pokemonService: PokemonService,
    private router: Router,
    private realtimeDbService: RealtimeDatabaseService,
    private authService: AuthService
  ) {
    this.cartItems$ = this.store.select(selectCartItems);
    console.log(this.cartItems$);
    this.checkoutForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
      pokemonSelections: this.fb.array([])
    });
  }

  ngOnInit() {
    this.cartItems$.subscribe(items => {
      this.loadPokemonEvolutions(items);
      this.updatePokemonSelections(items);
    });
  }

  private loadPokemonEvolutions(items: CartItem[]) {
    if (!items.length) return;
    
    this.loading = true;
    this.error = null;
    
    const evolutionRequests = items.map(item =>
      from(this.pokemonService.getPokemonSpecies(item.id.toString())).pipe(
        switchMap(species => {
          // Extract the evolution chain ID from the URL
          const evolutionChainId = species.evolution_chain.url
            .split('/')
            .filter(Boolean)
            .pop();
          return from(this.pokemonService.getPokemonEvolutionChain(evolutionChainId));
        }),
        map(chain => this.extractEvolutionChain(chain.chain)),
        // Add error handling for individual Pokemon
        catchError(error => {
          console.error(`Error loading evolution for Pokemon ${item.id}:`, error);
          return of([item.name]); // Return just the Pokemon's name if evolution fails
        })
      )
    );

    forkJoin(evolutionRequests).pipe(
      // Add timeout to prevent hanging
      timeout(10000),
      // Add retry logic
      retry(1),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (evolutions) => {
        items.forEach((item, index) => {
          this.pokemonEvolutions[item.id] = evolutions[index];
        });
      },
      error: (err) => {
        console.error('Error loading Pokemon evolutions:', err);
        this.error = 'Error loading Pokemon evolutions. Please try again.';
        // Set default evolution (just the Pokemon's name) for all items
        items.forEach(item => {
          this.pokemonEvolutions[item.id] = [item.name];
        });
      }
    });
  }

  private extractEvolutionChain(chain: PokemonEvolution): string[] {
    const evolutions: string[] = [chain.species.name];
    
    let current = chain;
    while (current.evolves_to.length > 0) {
      current = current.evolves_to[0];
      evolutions.push(current.species.name);
    }
    
    return evolutions;
  }

  private updatePokemonSelections(items: CartItem[]) {
    const selectionsArray = this.checkoutForm.get('pokemonSelections') as FormArray;
    selectionsArray.clear();

    items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        selectionsArray.push(
          this.fb.group({
            pokemonId: [item.id],
            selectedVariant: ['', Validators.required]
          })
        );
      }
    });
  }

  getEvolutionsForPokemon(pokemonId: number): string[] {
    return this.pokemonEvolutions[pokemonId] || [];
  }

  async onSubmit() {
    if (this.checkoutForm.valid) {
      try {
        this.loading = true;
        const formData = this.checkoutForm.value;
        const cartItems = await firstValueFrom(this.cartItems$);
        
        const user = this.authService.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        const orderData = {
          userId: user.uid,
          orderDate: new Date().toISOString(),
          customerInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address
          },
          items: cartItems.map((item, index) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            selectedVariant: formData.pokemonSelections[index]?.selectedVariant || item.name
          })),
          totalAmount: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
        };

        await this.realtimeDbService.saveOrder(orderData);
        
        this.store.dispatch(clearCart());
        
        this.router.navigate(['/checkout-success']);
      } catch (error) {
        console.error('Error submitting order:', error);
        this.error = 'Failed to submit order. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  }

  get pokemonSelections() {
    return this.checkoutForm.get('pokemonSelections') as FormArray;
  }
}
