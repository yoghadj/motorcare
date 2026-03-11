/**
 * Format number with thousand separator (Indonesian style: 1.234.567)
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const n = typeof value === "string" ? parseNumber(value) : Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("id-ID");
}

/**
 * Format as currency with Rp prefix (e.g. Rp 1.500.000)
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const n = typeof value === "string" ? parseNumber(value) : Number(value);
  if (Number.isNaN(n)) return "—";
  return `Rp ${n.toLocaleString("id-ID")}`;
}

/**
 * Parse string to number (Indonesian: dot = thousands, comma = decimal)
 */
export function parseNumber(value: string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const raw = String(value).replace(/\s/g, "");
  const comma = raw.indexOf(",");
  const intStr = comma >= 0 ? raw.slice(0, comma).replace(/\./g, "") : raw.replace(/\./g, "");
  const decStr = comma >= 0 ? raw.slice(comma + 1) : "";
  const s = decStr ? `${intStr}.${decStr}` : intStr;
  const n = parseFloat(s);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Format number for display in inputs (thousand separator)
 */
export function formatNumberForInput(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const n = typeof value === "string" ? parseNumber(value) : Number(value);
  if (Number.isNaN(n)) return "";
  return n.toLocaleString("id-ID");
}
