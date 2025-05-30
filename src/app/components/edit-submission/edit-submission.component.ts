import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
// import { RealtimeDatabaseService } from '../../services/realtime-database.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PokemonService } from '../../services/pokemon.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-submission',
  standalone: false,
  templateUrl: './edit-submission.component.html',
  styleUrls: ['./edit-submission.component.scss']
})
export class EditSubmissionComponent implements OnInit {
  submissionId: string = '';
  submissionForm: FormGroup;
  loading = false;
  error: string | null = null;
  selectedPokemonDetails: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    // private realtimeDbService: RealtimeDatabaseService,
    private pokemonService: PokemonService,
    private fb: FormBuilder
  ) {
    this.submissionForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      pokemonToBuy: [[]]
    });
  }

  async ngOnInit() {
    this.loading = true;
    // try {
    //   this.submissionId = this.route.snapshot.params['id'];
    //   const submission = await this.realtimeDbService.getFormSubmission(this.submissionId);
    //   if (submission) {
    //     this.submissionForm.patchValue(submission);
    //     // Always attempt to load Pokemon details if pokemonToBuy exists
    //     const pokemonToBuy = submission.pokemonToBuy;
    //     console.log('Pokemon to buy:', pokemonToBuy);
    //     if (pokemonToBuy) {
    //       await this.loadPokemonDetails(Array.isArray(pokemonToBuy) ? pokemonToBuy : [pokemonToBuy]);
    //     }
    //   }
    // } catch (error) {
    //   this.error = 'Error loading submission';
    //   console.error('Error:', error);
    // } finally {
    //   this.loading = false;
    // }
  }

  async loadPokemonDetails(pokemonNames: string[]) {
    try {
      // First, split the comma-separated names and flatten the array
      const allPokemonNames = pokemonNames
        .map(names => names.split(','))
        .flat()
        .map(name => name.trim().toLowerCase());

      // Now fetch details for each Pokemon
      this.selectedPokemonDetails = await Promise.all(
        allPokemonNames.map(async (name) => {
          try {
            const details = await this.pokemonService.getPokemonByName(name);
            return {
              name: details.name,
              image: details.sprites.front_default,
              types: details.types.map((type: any) => type.type.name),
              stats: details.stats.map((stat: any) => ({
                name: stat.stat.name,
                value: stat.base_stat
              }))
            };
          } catch (error) {
            console.error(`Error loading details for Pokemon ${name}:`, error);
            return {
              name: name,
              image: '',
              types: [],
              stats: []
            };
          }
        })
      );
      console.log('value' + this.selectedPokemonDetails);
    } catch (error) {
      console.error('Error loading Pokemon details:', error);
    }
  }

  async onSubmit() {
    if (this.submissionForm.valid) {
      try {
        this.loading = true;
        // await this.realtimeDbService.updateFormSubmission(
        //   this.submissionId,
        //   this.submissionForm.value
        // );
        this.router.navigate(['/submissions']);
      } catch (error) {
        console.error('Error updating submission:', error);
        this.error = 'Error updating submission';
      } finally {
        this.loading = false;
      }
    }
  }
}
