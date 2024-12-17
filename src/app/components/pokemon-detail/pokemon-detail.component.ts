import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PokemonService } from '../../services/pokemon.service';

interface PokemonEvolution {
  species: {
    name: string;
    url: string;
  };
  evolves_to: PokemonEvolution[];
}

interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  cries: {
    latest: string
    legacy: string
  };
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pokemonService: PokemonService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const name = params['id'];
      this.loadPokemonDetails(name);
      this.loadEvolvedPokemonList(name);
    });
  }

  private async loadPokemonDetails(name: string) {
    try {
      this.loading = true;
      
      const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${name}`;
      const details = await this.pokemonService.getPokemonDetails(pokemonUrl);
      this.pokemon = details;
    } catch (error) {
      console.error('Error loading pokemon details:', error);
      this.error = 'Failed to load Pokemon details';
    } finally {
      this.loading = false;
    }
  }

  private async loadEvolvedPokemonList(name:string) {
    try {
      this.loading = true;

      const pokemonSpecies = await this.pokemonService.getPokemonSpecies(name as string);
      const evolutionChainId = pokemonSpecies.evolution_chain.url.split('/').slice(-2, -1)[0];
      const pokemonEvolution = await this.pokemonService.getPokemonEvolutionChain(evolutionChainId);
      
      this.evolutionChain = pokemonEvolution.chain;
      this.evolutionList = this.extractEvolutionChain(this.evolutionChain);
      
      // Load evolution details
      this.evolutions = await Promise.all(
        this.evolutionList.map(async (name) => {
          const details = await this.pokemonService.getPokemonDetails(`https://pokeapi.co/api/v2/pokemon/${name}`);
          return details;
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

  private async loadPokemonDetailsByName(name: string) {
    try {
      this.loading = true;
      const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${name}`;
      const details = await this.pokemonService.getPokemonDetails(pokemonUrl);
      this.pokemon = details;
    } catch (error) {
      console.error('Error loading pokemon details:', error);
      this.error = 'Failed to load Pokemon details';
    } finally {
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
}
