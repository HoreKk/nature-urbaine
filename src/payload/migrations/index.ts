import * as migration_20260508_180727_initial from './20260508_180727_initial';
import * as migration_20260523_134357 from './20260523_134357';
import * as migration_20260523_140032 from './20260523_140032';
import * as migration_20260524_102559_remove_report_thumbnail_add_pictures_order from './20260524_102559_remove_report_thumbnail_add_pictures_order';
import * as migration_20260524_112015_add_pictures_s3_prefix from './20260524_112015_add_pictures_s3_prefix';
import * as migration_20260927_181732_payload_3_90_2 from './20260927_181732_payload_3_90_2';
import * as migration_20261017_225324_sizes_to_variants from './20261017_225324_sizes_to_variants';
import * as migration_20261017_225329_payload_4_beta from './20261017_225329_payload_4_beta';
import * as migration_20261018_120257_picture_medium_large_variants from './20261018_120257_picture_medium_large_variants';
import * as migration_20261020_230241_drop_seed_key from './20261020_230241_drop_seed_key';
import * as migration_20261022_235407_interview_pictures_media_variants from './20261022_235407_interview_pictures_media_variants';

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
    name: '20260523_140032',
  },
  {
    up: migration_20260524_102559_remove_report_thumbnail_add_pictures_order.up,
    down: migration_20260524_102559_remove_report_thumbnail_add_pictures_order.down,
    name: '20260524_102559_remove_report_thumbnail_add_pictures_order',
  },
  {
    up: migration_20260524_112015_add_pictures_s3_prefix.up,
    down: migration_20260524_112015_add_pictures_s3_prefix.down,
    name: '20260524_112015_add_pictures_s3_prefix',
  },
  {
    up: migration_20260927_181732_payload_3_90_2.up,
    down: migration_20260927_181732_payload_3_90_2.down,
    name: '20260927_181732_payload_3_90_2',
  },
  {
    up: migration_20261017_225324_sizes_to_variants.up,
    down: migration_20261017_225324_sizes_to_variants.down,
    name: '20261017_225324_sizes_to_variants',
  },
  {
    up: migration_20261017_225329_payload_4_beta.up,
    down: migration_20261017_225329_payload_4_beta.down,
    name: '20261017_225329_payload_4_beta',
  },
  {
    up: migration_20261018_120257_picture_medium_large_variants.up,
    down: migration_20261018_120257_picture_medium_large_variants.down,
    name: '20261018_120257_picture_medium_large_variants',
  },
  {
    up: migration_20261020_230241_drop_seed_key.up,
    down: migration_20261020_230241_drop_seed_key.down,
    name: '20261020_230241_drop_seed_key',
  },
  {
    up: migration_20261022_235407_interview_pictures_media_variants.up,
    down: migration_20261022_235407_interview_pictures_media_variants.down,
    name: '20261022_235407_interview_pictures_media_variants'
  },
];
