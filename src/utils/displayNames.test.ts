import { describe, expect, it } from 'vitest';

import { formatCountryName, formatLanguageName } from '@/utils/displayNames';

const names = {
  of(code: string) {
    return code === 'KR' ? 'Corée du Sud' : code === 'ko' ? 'coréen' : undefined;
  }
};

describe('displayNames helpers', () => {
  it('localizes country and language codes in French', () => {
    expect(formatCountryName('kr', names)).toBe('Corée du Sud');
    expect(formatLanguageName('KO', names)).toBe('coréen');
  });

  it('falls back to normalized raw codes', () => {
    expect(formatCountryName('xx', names)).toBe('XX');
    expect(formatLanguageName('zz', names)).toBe('zz');
  });
});
