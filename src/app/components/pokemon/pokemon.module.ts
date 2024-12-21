import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PokemonListComponent } from '../pokemon-list/pokemon-list.component';
import { PokemonDetailComponent } from '../pokemon-detail/pokemon-detail.component';
import { PokemonFormSubmissionComponent } from '../pokemon-form-submission/pokemon-form-submission.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { cartReducer } from '../../store/cart/cart.reducer';
import { CheckoutComponent } from '../checkout/checkout.component';

const routes: Routes = [
  {
    path: '',
    component: PokemonListComponent
  },
  {
    path: ':id',
    component: PokemonDetailComponent,
    data: {
      renderMode: 'dynamic'
    }
  }
];

@NgModule({
  declarations: [
    PokemonListComponent,
    PokemonDetailComponent,
    PokemonFormSubmissionComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('cart', cartReducer),
  ]
})
export class PokemonModule { }
