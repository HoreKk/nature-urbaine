import * as migration_20260429_221801 from './20260429_221801';

export const migrations = [
  {
    up: migration_20260429_221801.up,
    down: migration_20260429_221801.down,
    name: '20260429_221801'
  },
];
