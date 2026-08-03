export type DatabaseInitializationStatus = 'loading' | 'ready' | 'error';

export type EntityId = string;
export type IsoDateTimeString = string;
export type MoneyInPaise = number;
export type ScaledQuantity = number;

export type MigrationRecord = {
  applied_at: string;
  name: string;
  version: number;
};
