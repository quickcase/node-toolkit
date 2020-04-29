/**
 * @typedef {object} DocumentMetadata
 * @property {string} organisation Organisation ID
 * @property {string} caseType Case Type ID
 * @property {string} case Case 16-digit reference
 * @property {string} field Field ID or field path for Document fields within Collection or Complex types
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
  const res = await http.post(url, {metadata});
  return res.data;
};

/**
 * Get a document download in QuickCase Document Store.
 *
 * @param {httpClient} http Configured, ready-to-use HTTP client
 * @param {string} docId Identifier of the document to download
 * @return {Promise} Promise resolved with the new document download
 */
export const getDocument = (http) => async (docId) => {
  const url = `/documents/${docId}`;
  const res = await http.get(url);
  return res.data;
};
