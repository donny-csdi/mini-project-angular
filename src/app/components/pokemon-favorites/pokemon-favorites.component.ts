import { Component, OnInit } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';

interface Pokemon {
  name: string;
  id: number;
  image: string;
}

@Component({
  selector: 'app-pokemon-favorites',
  standalone: false,
  templateUrl: './pokemon-favorites.component.html',
  styleUrls: ['./pokemon-favorites.component.scss']
})
export class PokemonFavoritesComponent implements OnInit {
  availablePokemons: Pokemon[] = [];
  favoritePokemons: Pokemon[] = [];
  loading: boolean = false;
  
  constructor(private pokemonService: PokemonService) { }
  
  ngOnInit(): void {
    this.loadPokemons();
  }
  
  async loadPokemons() {
    try {
      this.loading = true;
      const response = await this.pokemonService.getPokemonList(10); // Limit to 10 for demo
      
      this.availablePokemons = await Promise.all(
        response.map(async (pokemon: any) => {
          const details = await this.pokemonService.getPokemonDetails(pokemon.url);
          return {
            name: pokemon.name,
            id: this.extractPokemonId(pokemon.url),
            image: details.sprites.front_default
          };
        })
      );
    } catch (error) {
      console.error('Error loading pokemons:', error);
    } finally {
      this.loading = false;
    }
  }
  
  private extractPokemonId(url: string): number {
    const matches = url.match(/\/(\d+)\/$/);
    return matches ? parseInt(matches[1]) : 0;
  }
  
  addToFavorites(pokemon: Pokemon): void {
    if (!this.favoritePokemons.some(p => p.id === pokemon.id)) {
      this.favoritePokemons.push(pokemon);
    }
  }
  
  removeFromFavorites(pokemon: Pokemon): void {
    this.favoritePokemons = this.favoritePokemons.filter(p => p.id !== pokemon.id);
  }
}
