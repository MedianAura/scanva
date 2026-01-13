#!/usr/bin/env node
/* global process */
import { readPackageSync } from 'read-pkg';
import updateNotifier from 'update-notifier';
import { run } from '../dist/entry.js';

const packageJSON = await readPackageSync();

updateNotifier({
  pkg: packageJSON,
  updateCheckInterval: 1000 * 60 * 60 * 24 * 7, // 1 week
}).notify();

const exitCode = await run();
process.exit(exitCode);
