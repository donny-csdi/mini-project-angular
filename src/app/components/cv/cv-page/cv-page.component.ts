import { Component } from '@angular/core';
import { CvService } from '../cv.service';

@Component({
  selector: 'app-cv-page',
  standalone: false,
  templateUrl: './cv-page.component.html',
  styleUrls: ['./cv-page.component.scss']
})
export class CvPageComponent {
  public cvData;
  techStack = ['Angular', 'TypeScript', 'HTML', 'CSS']
  
  counterStart: number = 0;
  incrementValue: number = 1;

  constructor(private cvService: CvService) { 
    this.cvData = this.cvService.getCvData();
  }
  
  updateCounterStart(value: number): void {
    this.counterStart = value;
  }
  
  updateIncrementBy(value: number): void {
    this.incrementValue = value;
  }
}
