export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  cries: {
    latest: string;
    legacy: string;
  };
  sprites: {
    front_default: string;
    back_default: string;
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
}

export interface PokemonEvolution {
  species: {
    name: string;
    url: string;
  };
  evolves_to: PokemonEvolution[];
}
