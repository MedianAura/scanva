import { Level } from '../enums/Level.js';

export interface Rule {
  files?: string;
  pattern: string;
  level: Level;
  find?: RegExp | string | string[];
}
