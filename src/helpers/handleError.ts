import { Logger } from './logger.js';

export function handleError(error: unknown): void {
  if (error instanceof Error) {
    Logger.error(error.message);
    return;
  }

  console.error('Unknown Error :', error);
}
