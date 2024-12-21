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

  constructor(private cvService: CvService) { 
    this.cvData = this.cvService.getCvData();
  }
}
