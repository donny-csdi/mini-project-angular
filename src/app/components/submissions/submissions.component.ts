import { Component, OnInit } from '@angular/core';
import { RealtimeDatabaseService } from '../../services/realtime-database.service';
import { HttpClient } from '@angular/common/http';

interface PokemonDetails {
  name: string;
  sprites: {
    front_default: string;
  };
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
  types: {
    type: {
      name: string;
    };
  }[];
}

interface Submission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phone: string;
  pokemonToBuy: string[];
  address: string;
  timestamp: string;
}

@Component({
  selector: 'app-submissions',
  standalone: false,
  templateUrl: './submissions.component.html',
  styleUrls: ['./submissions.component.scss']
})
export class SubmissionsComponent implements OnInit {
  submissions: Submission[] = [];
  selectedSubmission: Submission | null = null;
  pokemonDetails: { [key: string]: PokemonDetails } = {};
  isEditing = false;
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private realtimeDb: RealtimeDatabaseService,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    await this.loadSubmissions();
  }

  async loadSubmissions() {
    try {
      this.loading = true;
      this.error = null;
      const response = await this.realtimeDb.getFormSubmissions();
      
      if (!response) {
        this.submissions = [];
        return;
      }

      this.submissions = Object.entries(response).map(([id, data]: [string, any]) => ({
        id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phoneCountryCode: data.phoneCountryCode || '',
        phone: data.phone || '',
        pokemonToBuy: data.pokemonToBuy || [],
        address: data.address || '',
        timestamp: data.timestamp || new Date().toISOString()
      }));

      this.submissions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Error loading submissions:', error);
      this.error = 'Failed to load submissions. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async selectSubmission(submission: Submission) {
    try {
      this.loading = true;
      const freshData = await this.realtimeDb.getFormSubmission(submission.id);
      if (!freshData) {
        throw new Error('Submission not found');
      }

      this.selectedSubmission = {
        id: submission.id,
        firstName: freshData.firstName || '',
        lastName: freshData.lastName || '',
        email: freshData.email || '',
        phoneCountryCode: freshData.phoneCountryCode || '',
        phone: freshData.phone || '',
        pokemonToBuy: freshData.pokemonToBuy || [],
        address: freshData.address || '',
        timestamp: freshData.timestamp || new Date().toISOString()
      };

      // Load Pokemon details
      await this.loadPokemonDetails(this.selectedSubmission.pokemonToBuy);
      this.isEditing = true;
    } catch (error) {
      console.error('Error loading submission details:', error);
      this.error = 'Failed to load submission details. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async loadPokemonDetails(pokemonNames: string[]) {
    try {
      const promises = pokemonNames.map(name =>
        this.http.get<PokemonDetails>(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`).toPromise()
      );
      const details = await Promise.all(promises);
      
      this.pokemonDetails = details.reduce((acc, pokemon) => {
        if (pokemon) {
          acc[pokemon.name] = pokemon;
        }
        return acc;
      }, {} as { [key: string]: PokemonDetails });
    } catch (error) {
      console.error('Error loading Pokemon details:', error);
      this.error = 'Failed to load Pokemon details. Some information may be missing.';
    }
  }

  getStatColor(statValue: number): string {
    if (statValue >= 100) return '#4caf50';
    if (statValue >= 70) return '#8bc34a';
    if (statValue >= 50) return '#ffc107';
    return '#f44336';
  }

  async updateSubmission() {
    if (!this.selectedSubmission) return;

    try {
      this.loading = true;
      this.error = null;
      this.successMessage = null;
      await this.realtimeDb.updateFormSubmission(
        this.selectedSubmission.id,
        {
          firstName: this.selectedSubmission.firstName,
          lastName: this.selectedSubmission.lastName,
          email: this.selectedSubmission.email,
          phoneCountryCode: this.selectedSubmission.phoneCountryCode,
          phone: this.selectedSubmission.phone,
          pokemonToBuy: this.selectedSubmission.pokemonToBuy,
          address: this.selectedSubmission.address,
          timestamp: this.selectedSubmission.timestamp
        }
      );
      await this.loadSubmissions();
      this.cancelEdit();
      this.successMessage = 'Submission updated successfully!';
    } catch (error) {
      console.error('Error updating submission:', error);
      this.error = 'Failed to update submission. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async deleteSubmission(id: string) {
    if (confirm('Are you sure you want to delete this submission?')) {
      try {
        this.loading = true;
        this.error = null;
        await this.realtimeDb.deleteFormSubmission(id);
        await this.loadSubmissions();
      } catch (error) {
        console.error('Error deleting submission:', error);
        this.error = 'Failed to delete submission. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  }

  cancelEdit() {
    this.selectedSubmission = null;
    this.isEditing = false;
    this.error = null;
    this.successMessage = null;
    this.pokemonDetails = {};
  }
}
