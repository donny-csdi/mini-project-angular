import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PokemonService } from '../../services/pokemon.service';
import { Store } from '@ngrx/store';
import * as CartActions from '../../store/cart/cart.actions';
import { selectIsInCart, selectCartItems } from '../../store/cart/cart.selectors';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { PokemonDetail, PokemonEvolution } from '../../interfaces/pokemon.interface';

@Component({
  selector: 'app-pokemon-detail', 
  standalone: false,
  templateUrl: './pokemon-detail.component.html',
  styleUrls: ['./pokemon-detail.component.scss'],
})

export class PokemonDetailComponent implements OnInit {
  pokemon: PokemonDetail | null = null;
  evolutionChain: PokemonEvolution | null = null;
  currentEvolutionIndex: number = 0;
  evolutionList: string[] = [];
  listOfEvolvedPokemon: Array<any> = [];
  loading: boolean = false;
  error: string | null = null;
  isDevolvedDisable: boolean = true;
  isEvolvedDisable: boolean = true;
  showPurchaseForm: boolean = false;
  evolutions: any[] = [];
  cartQuantity: number = 0;
  isInCart: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pokemonService: PokemonService,
    private store: Store
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadPokemonDetails(params['id']);
        this.loadEvolvedPokemonList(params['id']);
      }
    });

    // Subscribe to cart state to check current quantity
    this.store.select(selectCartItems).subscribe(items => {
      if (this.pokemon) {
        const cartItem = items.find(item => item.id === this.pokemon?.id);
        this.cartQuantity = cartItem ? cartItem.quantity : 0;
      }
    });
  }

  async loadPokemonDetails(name: string) {
    try {
      this.loading = true;
      
      const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${name}`;
      this.pokemon = await this.pokemonService.getPokemonDetails(pokemonUrl);
      
      // Check cart status after pokemon is loaded
      if (this.pokemon) {
        const isInCart = await firstValueFrom(this.store.select(selectIsInCart(this.pokemon.id)));
        this.isInCart = isInCart;
      }
    } catch (error) {
      this.error = 'Error loading Pokemon details';
      console.error('Error:', error);
    } finally {
      this.loading = false;
    }
  }

  private async loadEvolvedPokemonList(name:string) {
    try {
      this.loading = true;

      const pokemonSpecies = await this.pokemonService.getPokemonSpecies(name);
      const evolutionChainId = pokemonSpecies.evolution_chain.url;
      const evolutions = await this.pokemonService.getPokemonEvolutionChain(evolutionChainId);
      
      this.evolutions = evolutions;
      this.evolutionList = evolutions.map(evo => evo.name);
      this.listOfEvolvedPokemon = [...this.evolutionList];
      
      // Load evolution details
      this.evolutions = await Promise.all(
        this.evolutionList.map(async (name) => {
          return await this.pokemonService.getPokemonByName(name);
        })
      );
      
      this.currentEvolutionIndex = this.evolutionList.findIndex(name => 
        name.toLowerCase() === this.pokemon?.name.toLowerCase()
      );

      this.isDevolvedDisable = this.currentEvolutionIndex <= 0;
      this.isEvolvedDisable = this.currentEvolutionIndex >= this.evolutionList.length - 1;

    } catch (error) {
      console.error('Error loading evolved pokemon details:', error);
      this.error = 'Failed to load evolved Pokemon details';
    } finally {
      this.loading = false;
    }
  }

  private extractEvolutionChain(chain: PokemonEvolution | null): string[] {
    const names: string[] = [];
    
    if (!chain) return names;
    names.push(chain.species.name);

    let currentChain = chain;
    while (currentChain.evolves_to.length > 0) {
      currentChain = currentChain.evolves_to[0];
      names.push(currentChain.species.name);
    }

    return names;
  }

  async loadPokemonDetailsByName(name: string) {
    try {
      this.loading = true;
      
      const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${name}`;
      const details = await this.pokemonService.getPokemonDetails(pokemonUrl);
      this.pokemon = details;
      // Check cart status after pokemon is loaded
      if (this.pokemon) {
        const isInCart = await firstValueFrom(this.store.select(selectIsInCart(this.pokemon.id)));
        this.isInCart = isInCart;
      }
    } catch (error) {
      this.error = 'Failed to load Pokemon details';
      console.error('Error:', error);
      this.loading = false;
    }
  }

  playCry() {
    if (this.pokemon?.cries.latest) {
      const audio = new Audio(this.pokemon.cries.latest);
      audio.play();
    } else {
      const audio = new Audio(this.pokemon?.cries.legacy);
      audio.play();
    }
  }

  async evolvePokemon() {
    if (this.currentEvolutionIndex < this.evolutionList.length - 1) {
      const nextPokemon = this.evolutionList[this.currentEvolutionIndex + 1];
      // await this.loadPokemonDetailsByName(nextPokemon);
      this.currentEvolutionIndex++;
      this.isDevolvedDisable = false;
      this.isEvolvedDisable = this.currentEvolutionIndex >= this.evolutionList.length - 1;
      this.router.navigate(['/pokemon', nextPokemon], { replaceUrl: true });
    }
  }

  async devolvePokemon() {
    if (this.currentEvolutionIndex > 0) {
      const previousPokemon = this.evolutionList[this.currentEvolutionIndex - 1];
      // await this.loadPokemonDetailsByName(previousPokemon);
      this.currentEvolutionIndex--;
      this.isEvolvedDisable = false;
      this.isDevolvedDisable = this.currentEvolutionIndex <= 0;
      this.router.navigate(['/pokemon', previousPokemon], { replaceUrl: true });
    }
  }

  goBack() {
    this.router.navigate(['/pokemon']);
  }

  togglePurchaseForm() {
    this.showPurchaseForm = !this.showPurchaseForm;
  }

  incrementQuantity() {
    this.cartQuantity++;
  }

  decrementQuantity() {
    if (this.cartQuantity > 0) {
      this.cartQuantity--;
    }
  }

  addToCart() {
    if (!this.pokemon) return;

    this.store.dispatch(CartActions.addToCart({ 
      item: {
        id: this.pokemon.id,
        name: this.pokemon.name,
        price: 10,
        quantity: 1,
        imageUrl: this.pokemon.sprites.front_default
      }
    }));
    
    this.cartQuantity++;
  }
}
