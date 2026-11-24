export const APP_NAME = 'FitStreak';
export const STORAGE_KEY = 'fitstreak:data';
export const BACKUP_KEY_PREFIX = 'fitstreak:backup:';
export const CORRUPTED_KEY_PREFIX = 'fitstreak:corrupted:';
export const MAX_AUTO_BACKUPS = 3;
export const SCHEMA_VERSION = 1;

/** Orientação da nutricionista. */
export const DEFAULT_WATER_GOAL_ML = 3300;
export const MIN_WATER_GOAL_ML = 500;
export const MAX_WATER_GOAL_ML = 10000;
export const QUICK_WATER_AMOUNTS = [250, 350, 500, 750, 1000] as const;
export const MAX_WATER_ENTRY_ML = 3000;

export const FREE_MEALS_PER_WEEK = 2;
export const MAX_TEXT_LENGTH = 1000;
export const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
