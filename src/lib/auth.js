/**
 * Decodes a JWT without verifying its signature.
 * @param {string} token - The JWT token.
 * @returns {object|null} - The decoded payload or null if invalid.
 */
export function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

/**
 * Checks if a JWT token is expired.
 * @param {string} token - The JWT token.
 * @returns {boolean} - True if expired, false otherwise.
 */
export function isTokenExpired(token) {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return true;
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}
