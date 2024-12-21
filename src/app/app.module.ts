import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { SubmissionsComponent } from './components/submissions/submissions.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { PokemonModule } from './components/pokemon/pokemon.module';
import { StoreModule } from '@ngrx/store';
import { CartComponent } from './components/cart/cart.component';
import { cartReducer } from './store/cart/cart.reducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AuthLayoutModule } from './components/layouts/auth-layout/auth-layout.module';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { CheckoutSuccessComponent } from './components/checkout-success/checkout-success.component';
import { EditSubmissionComponent } from './components/edit-submission/edit-submission.component';
import { CvModule } from './components/cv/cv.module';

@NgModule({
  declarations: [
    AppComponent,
    SubmissionsComponent,
    LoginComponent,
    RegisterComponent,
    CartComponent,
    CheckoutComponent,
    EditSubmissionComponent,
    CheckoutSuccessComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    PokemonModule,
    CvModule,
    AuthLayoutModule,
    StoreModule.forRoot({ cart: cartReducer }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production
    }),
  ],
  providers: [
    provideHttpClient(withFetch()),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
