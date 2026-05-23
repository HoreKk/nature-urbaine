import * as migration_20260508_180727_initial from './20260508_180727_initial';
import * as migration_20260523_134357 from './20260523_134357';
import * as migration_20260523_140032 from './20260523_140032';

export const migrations = [
  {
    up: migration_20260508_180727_initial.up,
    down: migration_20260508_180727_initial.down,
    name: '20260508_180727_initial',
  },
  {
    up: migration_20260523_134357.up,
    down: migration_20260523_134357.down,
    name: '20260523_134357',
  },
  {
    up: migration_20260523_140032.up,
    down: migration_20260523_140032.down,
    name: '20260523_140032'
  },
];
