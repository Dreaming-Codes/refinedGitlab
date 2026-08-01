const PREFIX = '[refined-gitlab]';

export function rgDebug(...args: unknown[]): void {
  if (import.meta.env?.DEV) {
    console.debug(PREFIX, ...args);
  }
}

export function rgWarn(...args: unknown[]): void {
  console.warn(PREFIX, ...args);
}

export function rgError(...args: unknown[]): void {
  console.error(PREFIX, ...args);
}
