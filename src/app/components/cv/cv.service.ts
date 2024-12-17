import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CvService {

  getCvData() {
    return {
      name: 'Donny Maxmillian',
      age: 23,
      image: '/rickandmorty.jpg',
      contacts: {
        phone: '+12-3456-7890',
        email: 'test@example.com',
      },
      techStack: ['HTML', 'CSS', 'JavaScript', 'TypeScript' , 'Angular']
    }
  }

  constructor() { }
}
