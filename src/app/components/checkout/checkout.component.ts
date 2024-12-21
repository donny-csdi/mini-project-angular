import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectCartItems } from '../../store/cart/cart.selectors';
import { PokemonService } from '../../services/pokemon.service';
import { CartItem } from '../../store/cart/cart.model';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { map, switchMap, catchError, timeout, retry, finalize, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { RealtimeDatabaseService } from '../../services/realtime-database.service';
import { clearCart, addToCart } from '../../store/cart/cart.actions';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';

interface PokemonEvolution {
  species: {
    name: string;
    url: string;
  };
  evolves_to: PokemonEvolution[];
}

interface PokemonWithEvolutions {
  cartItemId: string;
  name: string;
  evolutions: {
    name: string;
    imageUrl: string;
    selected: boolean;
  }[];
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  standalone: false,
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems$: Observable<CartItem[]>;
  pokemonWithEvolutions: PokemonWithEvolutions[] = [];
  loading = false;
  error: string | null = null;
  private cartItems: CartItem[] = []; // Store cart items locally

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private pokemonService: PokemonService,
    private router: Router,
    private realtimeDbService: RealtimeDatabaseService,
    private authService: AuthService
  ) {
    this.cartItems$ = this.store.select(selectCartItems);
    this.checkoutForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.loadPokemonEvolutions();
  }

  async loadPokemonEvolutions() {
    this.loading = true;
    this.error = null;

    try {
      // Get cart items once and store locally
      const items = await firstValueFrom(this.cartItems$.pipe(take(1)));
      this.cartItems = items;

      // Expand cart items based on quantity
      const expandedItems = items.flatMap(item => 
        Array(item.quantity).fill(null).map((_, index) => ({
          ...item,
          uniqueId: `${item.id}-${index}`
        }))
      );

      const results = await Promise.all(
        expandedItems.map(async (item) => {
          const pokemon = await this.pokemonService.getPokemonByName(item.name);
          const species = await this.pokemonService.getPokemonSpecies(pokemon.id.toString());
          const evolutionChainUrl = species.evolution_chain.url;
          const evolutions = await this.pokemonService.getPokemonEvolutionChain(evolutionChainUrl);

          return {
            cartItemId: item.uniqueId,
            name: item.name,
            evolutions: evolutions.map(evo => ({
              name: evo.name,
              imageUrl: evo.sprites.front_default,
              selected: evo.name === item.name
            }))
          };
        })
      );

      this.pokemonWithEvolutions = results;
      this.loading = false;
    } catch (error) {
      console.error('Error loading pokemon details:', error);
      this.error = 'Failed to load Pokemon details';
      this.loading = false;
    }
  }

  private getEvolutionList(chain: PokemonEvolution): string[] {
    const evolutions: string[] = [chain.species.name];
    
    const traverseEvolutions = (evolution: PokemonEvolution) => {
      if (evolution.evolves_to.length > 0) {
        for (const evo of evolution.evolves_to) {
          evolutions.push(evo.species.name);
          traverseEvolutions(evo);
        }
      }
    };
    
    traverseEvolutions(chain);
    return evolutions;
  }

  toggleEvolution(cartItemId: string, evolutionName: string) {
    const pokemon = this.pokemonWithEvolutions.find(p => p.cartItemId === cartItemId);
    if (pokemon) {
      const evolution = pokemon.evolutions.find(e => e.name === evolutionName);
      if (evolution) {
        evolution.selected = !evolution.selected;
      }
    }
  }

  async onSubmit() {
    if (this.checkoutForm.valid) {
      const formData = this.checkoutForm.value;
      const userId = this.authService.getCurrentUserId();
      
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      // Get selected pokemon names grouped by original pokemon
      const pokemonToBuy = this.pokemonWithEvolutions.map(pokemon => {
        const selectedEvolutions = pokemon.evolutions
          .filter(e => e.selected)
          .map(e => e.name);
        return selectedEvolutions.length > 0 ? selectedEvolutions : [pokemon.name];
      });

      const submission = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        pokemonToBuy: pokemonToBuy
      };

      try {
        this.loading = true;
        await this.realtimeDbService.saveFormSubmission(submission);
        
        // Clear the cart after successful submission
        this.store.dispatch(clearCart());
        
        // Navigate to checkout success page
        this.router.navigate(['/checkout-success']);
        
      } catch (error) {
        console.error('Error submitting order:', error);
        alert('Failed to submit order. Please try again.');
      } finally {
        this.loading = false;
      }
    }
  }
}
