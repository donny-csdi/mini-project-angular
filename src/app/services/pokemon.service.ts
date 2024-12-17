import { Injectable } from '@angular/core';
import axios, {  } from 'axios'

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  private url = 'https://pokeapi.co/api/v2/pokemon';
  private urlChain = 'https://pokeapi.co/api/v2/evolution-chain';
  private urlSpecies = 'https://pokeapi.co/api/v2/pokemon-species';

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

  async getPokemonEvolutionChain(id:string) {
    const response = await axios.get(`${this.urlChain}/${id}`);
    return response.data;
  }

  async getPokemonSpecies(id: string) {
    const response = await axios.get(`${this.urlSpecies}/${id}`);
    return response.data;
  }
}
