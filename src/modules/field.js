const equalsIgnoreCase = (expected) => (actual) => typeof actual === 'string' && actual.toUpperCase() === expected.toUpperCase();

/**
 * Unary operator to check the value of a `YesOrNo` field.
 * @param {any} value YesOrNo field value to compare to `No`
 * @return {boolean} whether the value was a string equals to `No` ignoring the case
 */
export const isNo = equalsIgnoreCase('No');

/**
 * Unary operator to check the value of a `YesOrNo` field.
 * @param {any} value YesOrNo field value to compare to `Yes`
 * @return {boolean} whether the value was a string equals to `Yes` ignoring the case
 */
export const isYes = equalsIgnoreCase('Yes');

/**
 * Convert a Javascript array to a QuickCase collection value.
 * @param {array} array Javascript array to convert to collection value
 * @return {array} Array formatted as a QuickCase collection
 */
export const newCollection = (array = []) => array.map((value) => ({value}));
