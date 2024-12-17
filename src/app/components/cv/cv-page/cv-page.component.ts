import { Component } from '@angular/core';
import { CvService } from '../cv.service';

@Component({
  selector: 'app-cv-page',
  standalone: false,

  templateUrl: './cv-page.component.html',
  styleUrl: './cv-page.component.scss'
})
export class CvPageComponent {
  public cvData;

  constructor(private cvService: CvService) { 
    this.cvData = this.cvService.getCvData();
  }
}
