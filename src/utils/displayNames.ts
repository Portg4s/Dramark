type DisplayNamesLike = {
  of(code: string): string | undefined;
};

function normalizeCode(code: string | undefined): string | undefined {
  const value = code?.trim();
  return value ? value : undefined;
}

function createDisplayNames(type: 'region' | 'language'): DisplayNamesLike | undefined {
  if (typeof Intl === 'undefined' || !('DisplayNames' in Intl)) {
    return undefined;
  }

  return new Intl.DisplayNames(['fr'], { type });
}

export function formatCountryName(
  code: string | undefined,
  displayNames: DisplayNamesLike | undefined = createDisplayNames('region')
): string | undefined {
  const normalizedCode = normalizeCode(code)?.toUpperCase();

  if (!normalizedCode) {
    return undefined;
  }

  return displayNames?.of(normalizedCode) ?? normalizedCode;
}

export function formatLanguageName(
  code: string | undefined,
  displayNames: DisplayNamesLike | undefined = createDisplayNames('language')
): string | undefined {
  const normalizedCode = normalizeCode(code)?.toLowerCase();

  if (!normalizedCode) {
    return undefined;
  }

  return displayNames?.of(normalizedCode) ?? normalizedCode;
}
