import { Component, OnInit } from '@angular/core';
import { RealtimeDatabaseService } from '../../services/realtime-database.service';
import { Router } from '@angular/router';

interface PokemonSubmission {
  name: string;
  type: string;
  level: number;
  email: string;
  phone: string;
  address: string;
  [key: string]: any;  // for any additional properties
}

interface SubmissionWithId extends PokemonSubmission {
  id: string;
}

@Component({
  selector: 'app-submissions',
  standalone: false,
  templateUrl: './submissions.component.html',
  styleUrls: ['./submissions.component.scss']
})
export class SubmissionsComponent implements OnInit {
  submissions: SubmissionWithId[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private realtimeDbService: RealtimeDatabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSubmissions();
  }

  async loadSubmissions() {
    try {
      this.loading = true;
      const data = await this.realtimeDbService.getFormSubmissions();
      this.submissions = Object.entries(data).map(([id, submission]) => ({
        id,
        ...(submission as PokemonSubmission)
      }));
    } catch (error) {
      console.error('Error loading submissions:', error);
      this.error = 'Failed to load submissions';
    } finally {
      this.loading = false;
    }
  }

  editSubmission(submissionId: string) {
    this.router.navigate(['/edit-submission', submissionId]);
  }

  async deleteSubmission(submissionId: string) {
    if (confirm('Are you sure you want to delete this submission?')) {
      try {
        await this.realtimeDbService.deleteFormSubmission(submissionId);
        this.submissions = this.submissions.filter(s => s.id !== submissionId);
      } catch (error) {
        console.error('Error deleting submission:', error);
        alert('Failed to delete submission');
      }
    }
  }
}
