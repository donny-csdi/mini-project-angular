import { Component, Input, Output, EventEmitter } from '@angular/core';

interface Pokemon {
  name: string;
  id: number;
  image: string;
}

@Component({
  selector: 'app-pokemon-card',
  standalone: false,
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.scss']
})
export class PokemonCardComponent {
  // Input properties from parent component
  @Input() pokemon!: Pokemon;
  @Input() isFavorite: boolean = false;
  
  // Output events to communicate with parent
  @Output() addToFavorites = new EventEmitter<Pokemon>();
  @Output() removeFromFavorites = new EventEmitter<Pokemon>();
  
  // Toggle favorite status
  toggleFavorite(): void {
    if (this.isFavorite) {
      this.removeFromFavorites.emit(this.pokemon);
    } else {
      this.addToFavorites.emit(this.pokemon);
    }
  }
}
