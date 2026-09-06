/**
 * Sanitizes any payload object before passing to Firestore setDoc/updateDoc.
 * Strips all undefined properties to prevent runtime database driver exceptions.
 */
export function sanitizePayload<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  return JSON.parse(
    JSON.stringify(data, (_key, value) => {
      return value === undefined ? null : value;
    })
  );
}
