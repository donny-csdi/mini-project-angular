import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { PokemonService } from '../../services/pokemon.service';
import { firstValueFrom } from 'rxjs';
import dayjs, { Dayjs } from 'dayjs';

interface Pokemon {
  name: string;
  url: string;
  id: number;
  image: string;
  element: string;
}

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PokemonListComponent implements OnInit, OnDestroy {

  public currentVideoId: string = 'bTqVqk7FSmY'; // Default video ID
  private player: any = null;

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
  selected: { startDate: Dayjs; endDate: Dayjs } | null = null;
  ranges: any = {
    'Today': [dayjs(), dayjs()],
    'Yesterday': [dayjs().subtract(1, 'days'), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [
      dayjs().subtract(1, 'month').startOf('month'),
      dayjs().subtract(1, 'month').endOf('month')
    ]
  };
  locale: any = {
    format: 'DD-MM-YYYY',
    displayFormat: 'DD-MM-YYYY',
    applyLabel: 'Cari',
    cancelLabel: 'Reset',
    fromLabel: 'From',
    toLabel: 'To',
    customRangeLabel: 'Custom Range',
    daysOfWeek: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
    monthNames: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
    firstDay: 1
  };

  constructor(
    private router: Router,
    private pokemonService: PokemonService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.initializePlyr();
    this.fetchPokemons();
  }

  private initializePlyr(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setVideoId('wJO_vIDZn-I')
      import('plyr').then(({ default: Plyr }) => {
        this.player = new Plyr('#plyrID', {
          controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
          youtube: {
            noCookie: true,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            controls: 0,
            playsinline: 1
          },
          clickToPlay: true
        });

        // Disable right-click on the entire player container
        const disableContextMenu = (e: Event) => {
          e.preventDefault();
          return false;
        };

        // Target the container element
        const container = document.querySelector('.plyr');
        if (container) {
          container.addEventListener('contextmenu', disableContextMenu, false);
        }

        // Also handle the video wrapper
        const playerElement = document.querySelector('.plyr__video-wrapper');
        if (playerElement) {
          playerElement.addEventListener('contextmenu', disableContextMenu, false);
        }
      });
    }
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

  setVideoId(videoId: string): void {
    this.currentVideoId = videoId;
    if (this.player) {
      this.player.source = {
        type: 'video',
        sources: [{
          src: videoId,
          provider: 'youtube'
        }]
      };
    }
  }

  searchByDateRange() {
    if (this.selected?.startDate && this.selected?.endDate) {
      const startDate = this.selected.startDate.format('YYYY-MM-DD');
      const endDate = this.selected.endDate.format('YYYY-MM-DD');
      console.log('Searching with date range:', { startDate, endDate });
      // Add your date range filtering logic here
    }
  }

  resetDateRange() {
    this.selected = null;
    // Reset any filtered results
    this.filteredPokemonList = [...this.pokemons];
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.destroy();
    }
  }
}
