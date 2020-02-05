/**
 * Given a case and the path to a field, extract the value of that field. When accessing case fields, this approach should
 * be preferred as a way to avoid hard references to case fields through the use of a fields map.
 *
 * @param aCase Case from which the field value should be extracted
 * @param path Path to a field using object notation.
 * @returns {any} Value associated to field path if found, `undefined` if case has no data or path cannot be found
 */
export const fieldExtractor = (aCase) => (path) => {
  const caseData = dataExtractor(aCase);
  return caseData ? field(caseData)(path.split('.')) : undefined;
};

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
  if (typeof from === 'object' && Object.keys(from).includes(nextElement)) {
    const nextValue = from[nextElement];
    if (remainingElements && remainingElements.length > 0) {
      return field(nextValue)(remainingElements);
    } else {
      return nextValue;
    }
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
