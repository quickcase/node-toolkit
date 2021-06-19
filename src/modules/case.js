const RADIX_36 = 36;
const COLLECTION_ITEM_PATTERN = /^([^\[\]]+)(?:\[([^\[\]]+)\])?$/;

/**
 * @typedef CreatePayload
 * @type {object}
 * @property {object} data Optional key value pairs of case fields for the new case
 * @property {string} summary Optional motivation of the case creation
 * @property {string} description Optional longer explanation of the case creation
 */

/**
 * Create a new case in QuickCase Data Store.
 *
 * @param {httpClient} http Configured, ready-to-use HTTP client
 * @param {string} caseTypeId Unique case type identifier
 * @param {string} eventId Unique event trigger identifier to use for creation
 * @param {CreatePayload} payload Object formed of optional `data`, `summary` and `description`
 * @return {Promise} Promise resolved with the created case
 */
export const createCase = (http) => (caseTypeId) => (eventId) => async (payload = {}) => {
  const {data: {token}} = await http.get(`/case-types/${caseTypeId}/event-triggers/${eventId}`);
  const createRes = await http.post(`/case-types/${caseTypeId}/cases`, {
    data: payload.data,
    event: {
      id: eventId,
      summary: payload.summary,
      description: payload.description,
    },
    event_token: token,
  });
  return createRes.data;
};

/**
 * Fetch a case from QuickCase Data Store by ID.
 *
 * @param {httpClient} http Configured, ready-to-use HTTP client
 * @param {string|number} caseId 16-digit unique case identifier
 * @return {Promise} Promise resolved with the case for the given identifier.
 */
export const fetchCase = (http) => (caseId) => async () => {
  const url = `/cases/${caseId}`;
  const res = await http.get(url);
  return res.data;
};

/**
 * Given a case and the path to a field, extract the value of that field. When accessing case fields, this approach should
 * be preferred as a way to avoid hard references to case fields through the use of a fields map.
 *
 * @param {object} aCase Case from which the field value should be extracted
 * @param {string|Array.<string>|object} path One or many paths to a field using object notation.
 * @returns {any} Value associated to field path if found, `undefined` if case has no data or path cannot be found
 */
export const fieldExtractor = (aCase) => (path) => {
  const extractor = singleFieldExtractor(aCase);
  if (typeof path === 'string') {
    return extractor(path);
  } else if(Array.isArray(path)) {
    return arrayFieldExtractor(extractor)(path);
  } else if(typeof path === 'object' && path !== null) {
    return objectFieldExtractor(extractor)(path);
  } else {
    throw `Unsupported path '${path}' of type ${typeof path}`;
  }
};

const singleFieldExtractor = (aCase) => (path) => {
  const caseData = dataExtractor(aCase);
  return caseData ? field(caseData)(path.split('.').map(parsePathElement)) : undefined;
};

const parsePathElement = (pathElement) => {
  const [_, name, itemId] = COLLECTION_ITEM_PATTERN.exec(pathElement);
  return {name, itemId};
};

const arrayFieldExtractor = (extractor) => (paths) => paths.map(extractor);

const objectFieldExtractor = (extractor) => (paths) => Object.fromEntries(
  Object.entries(paths).map(([key, path]) => [key, extractor(path)])
);

/**
 * Handle the fact that legacy search endpoint return cases with data under `case_data` while others endpoints return data under `data`.
 * While provided for convenience, function `fieldExtractor` should be preferred to avoid hard references to fields.
 *
 * @param aCase Case from which the data should be retrieved.
 * @returns {object} data property of the given case
 */
const dataExtractor = (aCase) => aCase && (aCase.data || aCase.case_data);

const field = (from) => (pathElements) => {
  const [nextElement, ...remainingElements] = pathElements;
  const nextValue = extractNextElement(from, nextElement);

  if (remainingElements && remainingElements.length > 0) {
    return field(nextValue)(remainingElements);
  } else {
    return nextValue;
  }
};

const isObjectWithKey = (obj, key) => obj && typeof obj === 'object' && Object.keys(obj).includes(key);

const extractCollectionItem = (collection, itemId) => {
  if (Array.isArray(collection)) {
    return collection[parseInt(itemId)];
  }
};

const extractNextElement = (from, {name, itemId}) => {
  if (isObjectWithKey(from, name)) {
    const nextValue = from[name];

    if (itemId) {
      return extractCollectionItem(nextValue, itemId);
    }

    return nextValue;
  }
};

/**
 * Check whether a string or number is a valid QuickCase case identifier.
 *
 * @param {string|number} identifier Identifier to validate
 * @return {boolean} Whether the identifier is valid
 */
export const isCaseIdentifier = (identifier) => /\d{16}/.test(identifier) && checkDigit(identifier);

const checkDigit = (number) => luhnSum(number) % 10 === 0;

const luhnSum = (number) => String(number).split('')
                                          .reverse()
                                          .map(Number)
                                          .reduce((acc, cur, i) => acc + luhnDigit(cur, i), 0);

const luhnDigit = (digit, index) => index % 2 === 0 ? digit : luhnDouble(digit);

const luhnDouble = (digit) => luhnCap(digit * 2);

const luhnCap = (digit) => digit > 9 ? digit - 9 : digit;

/**
 * Encode case identifier to base 36 string representation.
 * Pads 0s to return a string of minimum 11 characters.
 *
 * @param id - number
 * @returns {string} - base36 encoded string
 */
export const idTo36 = (id) => {
  const base36 = Number(id).toString(RADIX_36);
  let padding = '';
  for (let i = base36.length; i < 11; i++) {
    padding += '0';
  }

  return padding + base36;
};

/**
 * Decode case identifier from base 36 string representation
 *
 * @param base36String - base36 encoded string
 * @returns {string} - decoded case identifier
 */
export const idFrom36 = (base36String) => parseInt(base36String, RADIX_36).toString();

/**
 * Check if base 36 string representation is a valid case identifier
 *
 * @param base36String - base36 encoded string
 * @returns {boolean} - true/false
 */
export const isCaseIdentifier36 = (base36String) => isCaseIdentifier(idFrom36(base36String));

/**
 * @typedef UpdatePayload
 * @type {object}
 * @property {object} data Optional key value pairs of case fields to add/edit the case
 * @property {string} summary Optional motivation of the case update
 * @property {string} description Optional longer explanation of the case update
 */

/**
 * Update/progress an existing case in QuickCase Data Store.
 *
 * @param {httpClient} http Configured, ready-to-use HTTP client
 * @param {string} caseId 16-digit unique case identifier
 * @param {string} eventId Unique event trigger identifier to use for update
 * @param {UpdatePayload} payload Object formed of optional `data`, `summary` and `description`
 * @return {Promise} Promise resolved with the updated case
 */
export const updateCase = (http) => (caseId) => (eventId) => async (payload = {}) => {
  const {data: {token}} = await http.get(`/cases/${caseId}/event-triggers/${eventId}`);
  const updateRes = await http.post(`/cases/${caseId}/events`, {
    data: payload.data,
    event: {
      id: eventId,
      summary: payload.summary,
      description: payload.description,
    },
    event_token: token,
  });
  return updateRes.data;
};
