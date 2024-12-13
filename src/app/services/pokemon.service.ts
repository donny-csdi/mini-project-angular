import { Injectable } from '@angular/core';
import axios, {  } from 'axios'

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  private url = 'https://pokeapi.co/api/v2/pokemon';

  constructor() {
    console.log('PokemonService created');
  }

  async getPokemons(limit:number = 500) {
    const response = await axios.get(`${this.url}?limit=${limit}`);
    return response.data.results;
  }

  async getPokemonDetails(url:string) {
    const response = await axios.get(url);
    return response.data;
  }
}
