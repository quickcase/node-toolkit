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
