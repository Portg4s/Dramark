export class TmdbRequestError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'TmdbRequestError';
  }
}
