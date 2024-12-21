import { RenderMode, ServerRoute } from '@angular/ssr';
import axios from 'axios';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'pokemon',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'submissions',
    renderMode: RenderMode.Prerender,
  },
  // Dynamic Pokémon details route
  {
    path: 'pokemon/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      try {
        // Fetch Pokémon list from the API
        const response = await axios.get(
          'https://pokeapi.co/api/v2/pokemon?limit=100'
        );
        
        // Extract IDs from the URLs
        const pokemonIds = response.data.results.map((pokemon: any) => {
          const urlParts = pokemon.url.split('/');
          return { id: urlParts[urlParts.length - 2] }; // Get the ID from the URL
        });
        
        return pokemonIds;
      } catch (error) {
        console.error('Error fetching Pokémon IDs:', error);
        return [];
      }
    },
  },
  // Dynamic submission edit route
  {
    path: 'edit-submission/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      try {
        // Replace with your backend endpoint for fetching submission IDs
        const response = await axios.get('https://example.com/api/submissions');
        const submissionIds = response.data.map(
          (submission: any) => submission.id
        );
        return submissionIds.map((id: any) => ({ id }));
      } catch (error) {
        console.error('Error fetching submission IDs:', error);
        return [];
      }
    },
  },
  // Fallback to server-side rendering for other routes
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
