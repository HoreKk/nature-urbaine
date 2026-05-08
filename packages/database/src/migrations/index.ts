import * as migration_20260508_180727_initial from './20260508_180727_initial';

export const migrations = [
  {
    up: migration_20260508_180727_initial.up,
    down: migration_20260508_180727_initial.down,
    name: '20260508_180727_initial'
  },
];
