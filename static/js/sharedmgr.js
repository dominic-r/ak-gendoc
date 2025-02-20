/**
 * Encodes a configuration object as a Base64-encoded JSON string.
 * @param {Object} data - The configuration object to encode.
 * @returns {string} The Base64-encoded JSON string.
 */
function encodeConfig(data) {
  const json = JSON.stringify(data);
  return btoa(json);
}

/**
* Decodes a Base64-encoded JSON string into an object.
* @param {string} encodedData - The Base64-encoded JSON string.
* @returns {Object|null} The decoded object, or null if decoding fails.
*/
function decodeConfig(encodedData) {
  try {
      const json = atob(encodedData);
      return JSON.parse(json);
  } catch (e) {
      console.error('Error decoding configuration:', e);
      return null;
  }
}
