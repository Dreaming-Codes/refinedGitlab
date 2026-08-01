import { describe, expect, test } from 'bun:test';
import { parsePlusMinus } from './scrape';

describe('parsePlusMinus', () => {
  test('both sides', () => {
    expect(parsePlusMinus('+12 -3')).toEqual({ added: 12, removed: 3 });
  });

  test('added only defaults removed to 0', () => {
    expect(parsePlusMinus('+12')).toEqual({ added: 12, removed: 0 });
  });

  test('removed only with unicode minus', () => {
    expect(parsePlusMinus('−3')).toEqual({ added: 0, removed: 3 });
    expect(parsePlusMinus('-3')).toEqual({ added: 0, removed: 3 });
  });

  test('thousands separators', () => {
    expect(parsePlusMinus('+1,234 -5')).toEqual({ added: 1234, removed: 5 });
  });

  test('zero deletions', () => {
    expect(parsePlusMinus('+12 -0')).toEqual({ added: 12, removed: 0 });
  });

  test('no stats', () => {
    expect(parsePlusMinus('nope')).toBeNull();
  });
});
