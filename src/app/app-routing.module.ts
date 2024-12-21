import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CvPageComponent } from './components/cv/cv-page/cv-page.component';
import { SubmissionsComponent } from './components/submissions/submissions.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AuthLayoutComponent } from './components/layouts/auth-layout/auth-layout.component';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';
import { CanDeactivateGuard } from './guards/can-deactivate.guard';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { CheckoutSuccessComponent } from './components/checkout-success/checkout-success.component';
import { EditSubmissionComponent } from './components/edit-submission/edit-submission.component';

const routes: Routes = [

      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'register',
        component: RegisterComponent
      },
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'pokemon',
        loadChildren: () => import('./components/pokemon/pokemon.module').then(m => m.PokemonModule)
      },
      {
        path: 'submissions',
        component: SubmissionsComponent,
        canDeactivate: [CanDeactivateGuard]
      },
      {
        path: 'edit-submission/:id',
        component: EditSubmissionComponent,
        data: {
          renderMode: 'dynamic'
        }
      },
      {
        path: 'cart',
        component: CartComponent
      },
      {
        path: 'checkout',
        component: CheckoutComponent
      },
      {
        path: 'checkout-success',
        component: CheckoutSuccessComponent
      },
      {
        path: '',
        component: CvPageComponent
      }
    ]
  },
  // {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
