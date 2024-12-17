import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PokemonListComponent } from './components/pokemon-list/pokemon-list.component';
import { PokemonDetailComponent } from './components/pokemon-detail/pokemon-detail.component';
import { CvPageComponent } from './components/cv/cv-page/cv-page.component';
import { SubmissionsComponent } from './components/submissions/submissions.component';
const routes: Routes = [
  {
    path: 'pokemon', component: PokemonListComponent
  },
  {
    path: 'pokemon/:id', component: PokemonDetailComponent
  },
  {
    path: 'submissions', component: SubmissionsComponent
  },
  {
    path: '**', component: CvPageComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
