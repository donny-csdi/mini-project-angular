import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RealtimeDatabaseService } from '../../services/realtime-database.service';

interface CountryCode {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
}

@Component({
  selector: 'app-pokemon-form-submission',
  standalone: false,
  templateUrl: './pokemon-form-submission.component.html',
  styleUrls: ['./pokemon-form-submission.component.scss']
})
export class PokemonFormSubmissionComponent implements OnInit {
  @Input() pokemon!: Pokemon;
  @Input() evolutions: Pokemon[] = [];
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  
  purchaseForm!: FormGroup;
  selectedPokemons: Pokemon[] = [];
  successMessage: string | null = null;
  error: string | null = null;
  
  countryCodes: CountryCode[] = [
    { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩', dialCode: '+62' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  ];

  constructor(
    private fb: FormBuilder,
    private realtimeDb: RealtimeDatabaseService
  ) {}

  ngOnInit() {
    if (!this.evolutions.find(p => p.id === this.pokemon.id)) {
      this.evolutions = [this.pokemon, ...this.evolutions];
    }

    this.purchaseForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,12}$')]],
      selectedPokemonIds: [[], [Validators.required, Validators.minLength(1)]],
      address: ['', [Validators.required]],
    });
  }

  onPokemonSelectionChange(event: any, pokemon: Pokemon) {
    const isChecked = event.target.checked;
    
    if (isChecked) {
      this.selectedPokemons.push(pokemon);
    } else {
      this.selectedPokemons = this.selectedPokemons.filter(p => p.id !== pokemon.id);
    }
    
    this.purchaseForm.patchValue({
      selectedPokemonIds: this.selectedPokemons.map(p => p.id)
    });
  }

  isSelected(pokemon: Pokemon): boolean {
    return this.selectedPokemons.some(p => p.id === pokemon.id);
  }

  removePokemon(pokemon: Pokemon) {
    this.selectedPokemons = this.selectedPokemons.filter(p => p.id !== pokemon.id);
    this.purchaseForm.patchValue({
      selectedPokemonIds: this.selectedPokemons.map(p => p.id)
    });
  }

  toggleModal() {
    this.closeModal.emit();
  }

  async onSubmit() {
    if (this.purchaseForm.valid) {
      const order = {
        firstName: this.purchaseForm.value.firstName,
        lastName: this.purchaseForm.value.lastName,
        email: this.purchaseForm.value.email,
        phoneCountryCode: this.purchaseForm.value.countryCode,
        phone: this.purchaseForm.value.phoneNumber,
        pokemonToBuy: this.selectedPokemons.map(p => p.name),
        address: this.purchaseForm.value.address,
        timestamp: new Date().toISOString()
      };

      try {
        await this.realtimeDb.saveFormSubmission(order);
        this.successMessage = 'Order submitted successfully!';
        console.log('Order submitted successfully:', order);
        this.purchaseForm.reset();
        this.selectedPokemons = [];
        setTimeout(() => {
          this.successMessage = null;
          this.toggleModal();
        }, 2000);
      } catch (error) {
        console.error('Error submitting order:', error);
        this.error = 'Failed to submit order. Please try again.';
      }
    } else {
      Object.keys(this.purchaseForm.controls).forEach(key => {
        const control = this.purchaseForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
