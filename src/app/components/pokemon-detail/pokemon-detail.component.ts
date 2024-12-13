import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PokemonService } from '../../services/pokemon.service';

interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
}

@Component({
  selector: 'app-pokemon-detail', 
  standalone: false,
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.scss'
})
export class PokemonDetailComponent implements OnInit {
  pokemon: PokemonDetail | null = null;
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pokemonService: PokemonService
  ) { }

  ngOnInit(): void {
    this.loadPokemonDetails();
  }

  private async loadPokemonDetails() {
    try {
      this.loading = true;
      const url = this.route.snapshot.paramMap.get('id');
      
      const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${url}`;
      const details = await this.pokemonService.getPokemonDetails(pokemonUrl);
      this.pokemon = details;
    } catch (error) {
      console.error('Error loading pokemon details:', error);
      this.error = 'Failed to load Pokemon details';
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.router.navigate(['/pokemon']);
  }
}
