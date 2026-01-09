import { z } from 'zod';
import { Level } from '../enums/Level.js';

// Zod schemas for configuration validation
const RuleSchema = z
  .object({
    files: z.string().optional(),
    pattern: z.string(),
    level: z.enum(Level),
    find: z.union([z.instanceof(RegExp), z.string(), z.array(z.string())]).optional(),
  })
  .strict();

export const ScanvaConfigSchema = z
  .object({
    rules: z.array(RuleSchema).default([]),
  })
  .strict();
