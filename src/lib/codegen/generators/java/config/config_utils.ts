/**
 * Extracts the plain string value from a Java string literal produced by the
 * code generator. Java and JSON share the same common escape sequences, so
 * JSON.parse is used to properly handle them. Non-string expressions (numbers,
 * booleans, variable references …) are returned unchanged.
 */
export function extractStringLiteral(code: string): string {
    if (code.startsWith('"') && code.endsWith('"') && code.length >= 2) {
        try {
            return JSON.parse(code) as string;
        } catch {
            // Fallback: strip just the outer quotes
            return code.slice(1, -1);
        }
    }
    return code;
}
