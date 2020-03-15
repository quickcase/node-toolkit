/**
 * @typedef {object} DocumentMetadata
 * @property {string} organisation Organisation ID
 * @property {string} caseType Case Type ID
 * @property {string} field Field path
 */

/**
 * Create a new document upload in QuickCase Document Store.
 *
 * @param {httpClient} http Configured, ready-to-use HTTP client
 * @param {DocumentMetadata} metadata Document metadata, used for access control
 * @return {Promise} Promise resolved with the new document upload
 */
export const createDocument = (http) => async (metadata) => {
  const url = '/documents';
  const res = await http.post(url, metadata);
  return res.data;
};
