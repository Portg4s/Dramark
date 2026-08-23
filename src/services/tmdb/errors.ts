export class MissingTmdbConfigurationError extends Error {
  constructor() {
    super('Configuration TMDB absente: renseigner VITE_TMDB_ACCESS_TOKEN.');
    this.name = 'MissingTmdbConfigurationError';
  }
}

export class TmdbRequestError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'TmdbRequestError';
  }
}
