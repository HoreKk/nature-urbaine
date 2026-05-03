import * as migration_20260429_221801 from './20260429_221801';
import * as migration_20260501_000000 from './20260501_000000';
import * as migration_20260503_000000 from './20260503_000000';

export const migrations = [
  {
    up: migration_20260429_221801.up,
    down: migration_20260429_221801.down,
    name: '20260429_221801'
  },
  {
    up: migration_20260501_000000.up,
    down: migration_20260501_000000.down,
    name: '20260501_000000'
  },
  {
    up: migration_20260503_000000.up,
    down: migration_20260503_000000.down,
    name: '20260503_000000'
  },
];
