/**
 * Fetch a case type definition from QuickCase Definition Store.
 *
 * @param {httpClient} http Configured, ready-to-use HTTP client
 * @param {string} caseTypeId Identifier of case type to fetch
 * @return {Promise} Promise resolved with the definition of the case type
 */
export const fetchCaseType = (http) => (caseTypeId) => async () => {
  const url = `/api/data/case-type/${caseTypeId}`;
  const res = await http.get(url);
  return res.data;
};
