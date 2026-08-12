type CsvValue = string | number | boolean | null | undefined;

interface CsvOptions {
  /** Optional custom headers. If omitted and data is objects, object keys are used. */
  headers?: string[];
  /** Add UTF-8 BOM for Excel compatibility. Defaults to true. */
  includeBom?: boolean;
}

/**
 * Unified RFC 4180-compliant CSV builder.
 * Escapes values containing commas, quotes, or newlines.
 */
export function toCsv(
  data: Record<string, CsvValue>[] | CsvValue[][],
  options: CsvOptions = {}
): string {
  if (!data || data.length === 0) return '';

  let headers: string[] = [];
  let rows: CsvValue[][] = [];

  // Determine if input is an array of objects or array of arrays
  const isObjectArray = typeof data[0] === 'object' && data[0] !== null && !Array.isArray(data[0]);

  if (isObjectArray) {
    const objectData = data as Record<string, CsvValue>[];
    headers = options.headers || Object.keys(objectData[0]);
    rows = objectData.map((row) => headers.map((h) => row[h]));
  } else {
    rows = data as CsvValue[][];
    headers = options.headers || [];
  }

  const escapeCell = (value: CsvValue): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    
    // Smart escaping: only quote if it contains a comma, quote, or newline
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [];
  
  if (headers.length > 0) {
    lines.push(headers.map(escapeCell).join(','));
  }
  
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(','));
  }

  // Standard CSV row delimiters
  const csvContent = lines.join('\r\n');
  const includeBom = options.includeBom ?? true;
  
  // Leading BOM so Excel doesn't mangle UTF-8 (accented names, etc.)
  return includeBom ? '\uFEFF' + csvContent : csvContent;
}