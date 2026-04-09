export interface ParsedPetAge {
  ageYears: number | null;
  ageMonths: number | null;
}

export function parseLegacyAge(ageText?: string | null): ParsedPetAge {
  if (!ageText) return { ageYears: null, ageMonths: null };
  const text = ageText.toLowerCase();

  const yearsMatch = text.match(/(\d+)\s*(y|yr|yrs|year|years|año|años|an|ans)/i);
  const monthsMatch = text.match(/(\d+)\s*(m|mo|mos|month|months|mes|meses)/i);

  const years = yearsMatch ? Number(yearsMatch[1]) : null;
  const months = monthsMatch ? Number(monthsMatch[1]) : null;

  if (years != null || months != null) {
    return {
      ageYears: years != null && Number.isFinite(years) ? Math.max(0, years) : null,
      ageMonths: months != null && Number.isFinite(months) ? Math.max(0, Math.min(11, months)) : null,
    };
  }

  const onlyNumber = Number(text.replace(/[^\d]/g, ''));
  if (Number.isFinite(onlyNumber) && onlyNumber > 0) {
    return { ageYears: Math.max(0, onlyNumber), ageMonths: null };
  }

  return { ageYears: null, ageMonths: null };
}

export function formatPetAge(
  ageYears?: number | null,
  ageMonths?: number | null,
  legacyAgeText?: string | null
): string {
  const years = ageYears != null ? Number(ageYears) : null;
  const months = ageMonths != null ? Number(ageMonths) : null;

  const validYears = years != null && Number.isFinite(years) && years >= 0 ? Math.floor(years) : null;
  const validMonths = months != null && Number.isFinite(months) && months >= 0 ? Math.floor(months) : null;

  const parts: string[] = [];
  if (validYears != null && validYears > 0) parts.push(`${validYears}y`);
  if (validMonths != null && validMonths > 0) parts.push(`${validMonths}m`);

  if (parts.length > 0) return parts.join(' ');
  if (validYears === 0 && validMonths === 0) return '0m';
  if (legacyAgeText && legacyAgeText.trim().length > 0) return legacyAgeText;
  return '--';
}

