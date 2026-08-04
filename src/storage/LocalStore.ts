import { storage } from './MMKV';

export const getString = (key: string): string | undefined => storage.getString(key);

export const setString = (key: string, value: string): void => {
  storage.set(key, value);
};

export const getJSON = <T>(key: string): T | undefined => {
  const raw = storage.getString(key);
  return raw ? (JSON.parse(raw) as T) : undefined;
};

export const setJSON = <T>(key: string, value: T): void => {
  storage.set(key, JSON.stringify(value));
};
