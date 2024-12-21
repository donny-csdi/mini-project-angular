import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PokemonService } from '../../services/pokemon.service';
import { firstValueFrom } from 'rxjs';

interface Pokemon {
  name: string;
  url: string;
  id: number;
  image: string;
  element: string;
}

@Component({
  selector: 'app-pokemon-list',
  standalone: false,
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.scss']
})
export class PokemonListComponent implements OnInit {
  pokemons: Pokemon[] = [];
  filteredPokemonList: Pokemon[] = [];
  paginatedPokemon: Pokemon[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  selectedElement: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 0;
  elements: string[] = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic',
    'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];
  selectedPokemon: Pokemon | null = null;

  constructor(
    private pokemonService: PokemonService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchPokemons();
  }

  async fetchPokemons() {
    try {
      this.loading = true;
      const response = await this.pokemonService.getPokemonList();
      
      const pokemonData = await Promise.all(
        response.map(async (pokemon: any) => {
          const details = await this.pokemonService.getPokemonDetails(
            pokemon.url
          );
        return {
          name: pokemon.name,
          url: pokemon.url,
          id: this.extractPokemonId(pokemon.url),
          image: details.sprites.front_default,
          element: details.types[0].type?.name
        };
      }));
      
      this.pokemons = pokemonData;
      this.filteredPokemonList = this.pokemons;
      this.updatePagination();
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

  filterPokemons() {
    this.filteredPokemonList = this.pokemons.filter(pokemon => {
      const matchesSearch = pokemon.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesElement = !this.selectedElement || pokemon.element === this.selectedElement;
      return matchesSearch && matchesElement;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  filterByElement(element: string) {
    this.selectedElement = this.selectedElement === element ? '' : element;
    this.filterPokemons();
  }

  updatePagination() {
    this.totalPages = Math.ceil(
      this.filteredPokemonList.length / this.itemsPerPage
    );
    this.paginate();
  }

  paginate() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedPokemon = this.filteredPokemonList.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginate();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginate();
    }
  }

  viewDetails(pokemon: Pokemon, event: Event) {
    event.stopPropagation(); // Prevent card click event
    this.router.navigate(['/pokemon', pokemon.name]);
  }

  selectPokemon(pokemon: Pokemon) {
    this.selectedPokemon = this.selectedPokemon?.name === pokemon.name ? null : pokemon;
  }
}
