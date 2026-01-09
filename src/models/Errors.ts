import { CustomError } from 'ts-custom-error';

export class ConfigurationNotFoundError extends CustomError {
  public constructor(message: string) {
    super(message);
    // Set name explicitly as minification can mangle class names
    Object.defineProperty(this, 'name', { value: 'ConfigurationNotFoundError' });
  }
}
