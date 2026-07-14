/**
 * Built-in translations for the Ctrl+Wheel zoom hint overlay.
 * Keys are ISO 639-1 language codes (lowercase).
 * Note: German keyboards show "Strg" (Steuerung) instead of "Ctrl".
 *
 * @type {Record<string, string>}
 */
const SCROLL_HINT_MESSAGES = {
  en: 'Use <kbd>Ctrl</kbd> + scroll to zoom',
  it: 'Usa <kbd>Ctrl</kbd> + scroll per zoomare',
  de: 'Mit <kbd>Strg</kbd> + Scrollen zoomen',
  fr: 'Utilisez <kbd>Ctrl</kbd> + défilement pour zoomer',
  es: 'Usa <kbd>Ctrl</kbd> + rueda para hacer zoom'
};

/**
 * Resolve the scroll hint message to display in the Ctrl+Wheel overlay.
 *
 * Priority:
 *  1. options.scrollHint           — explicit override (any string / HTML)
 *  2. options.scrollHintMessages   — developer-supplied map keyed by lang code
 *  3. built-in SCROLL_HINT_MESSAGES table (en, it, de, fr, es)
 *  4. English fallback
 *
 * Language is detected from <html lang="..."> (first segment, e.g. "it" from "it-IT").
 *
 * @param {{ scrollHint?: string, scrollHintMessages?: Record<string, string> }} options
 * @returns {string} HTML string (may contain <kbd> tags)
 */
export function getScrollHint(options) {
  // 1. Explicit string override
  if (options.scrollHint) return options.scrollHint;

  // Detect language from the page
  const lang = (
    (typeof document !== 'undefined' && document.documentElement.lang) || 'en'
  )
    .split('-')[0]
    .toLowerCase();

  // 2. Developer-supplied messages map
  if (options.scrollHintMessages && options.scrollHintMessages[lang]) {
    return options.scrollHintMessages[lang];
  }

  // 3. Built-in table with English fallback
  return SCROLL_HINT_MESSAGES[lang] ?? SCROLL_HINT_MESSAGES.en;
}
