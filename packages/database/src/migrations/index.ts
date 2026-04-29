import * as migration_20260425_180937 from './20260425_180937';
import * as migration_20260428_133107 from './20260428_133107';
import * as migration_20260429_220845 from './20260429_220845';

export const migrations = [
  {
    up: migration_20260425_180937.up,
    down: migration_20260425_180937.down,
    name: '20260425_180937',
  },
  {
    up: migration_20260428_133107.up,
    down: migration_20260428_133107.down,
    name: '20260428_133107',
  },
  {
    up: migration_20260429_220845.up,
    down: migration_20260429_220845.down,
    name: '20260429_220845'
  },
];
