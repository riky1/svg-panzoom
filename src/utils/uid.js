let _uid = 0;

/**
 * Generate a simple unique id (per page load).
 * @param {string} [prefix]
 */
export function uid(prefix = 'spz') {
  _uid += 1;
  return `${prefix}-${_uid}`;
}
