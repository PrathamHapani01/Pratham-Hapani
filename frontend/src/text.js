export function isPlaceholder(value) {
  return /edit[\s_]*me/i.test(String(value ?? ""));
}

export function cleanText(value, fallback = "") {
  if (value == null) return fallback;
  const text = String(value).trim();
  if (!text || isPlaceholder(text)) return fallback;
  return text;
}
