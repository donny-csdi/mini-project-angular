import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvPageComponent } from './cv-page/cv-page.component';
import { CvService } from './cv.service';
import { PokemonCounterComponent } from '../pokemon-counter/pokemon-counter.component';
import { PokemonFavoritesComponent } from '../pokemon-favorites/pokemon-favorites.component';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';

@NgModule({
  declarations: [
    CvPageComponent,
    PokemonCounterComponent,
    PokemonFavoritesComponent,
    PokemonCardComponent
  ],
  imports: [
    CommonModule
  ],
  providers: [CvService],
  exports: [
    CvPageComponent
  ]
})
export class CvModule { }
