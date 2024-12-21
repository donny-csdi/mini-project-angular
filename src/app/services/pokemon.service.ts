// src/app/services/pokemon.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon';
  private apiSpeciesUrl = 'https://pokeapi.co/api/v2/pokemon-species';

  constructor(private http: HttpClient) {
    console.log('PokemonService: Constructor called');
  }

  async getPokemonTypes(): Promise<string[]> {
    const response = await firstValueFrom(
      this.http.get<any>('https://pokeapi.co/api/v2/type')
    );
    return response.results.map((type: any) => type.name);
  }

  async getPokemonList(limit: number = 500): Promise<any[]> {
    const response = await firstValueFrom(
      this.http.get<any>(`${this.apiUrl}?limit=${limit}`)
    );
    return response.results;
  }

  async getPokemonDetails(url: string): Promise<any> {
    return firstValueFrom(this.http.get<any>(url));
  }

  async getPokemonByName(name: string): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/${name}`));
  }

  async getPokemonSpecies(name: string): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.apiSpeciesUrl}/${name}`));
  }

  async getPokemonEvolutionChain(url: string): Promise<any[]> {
    const response = await firstValueFrom(this.http.get<any>(url));
    const chain = response.chain;

    const evolutions = this.parseEvolutionChain(chain);
    const detailedEvolutions = await Promise.all(
      evolutions.map(async (evo) => {
        const details = await this.getPokemonByName(evo.name);
        return {
          ...evo,
          sprites: details.sprites,
          selected: true,
        };
      })
    );

    return detailedEvolutions;
  }

  private parseEvolutionChain(chain: any): any[] {
    const evolutions = [];
    let current = chain;

    while (current) {
      evolutions.push({
        name: current.species.name,
        url: current.species.url,
      });
      current = current.evolves_to[0];
    }

    return evolutions;
  }
}