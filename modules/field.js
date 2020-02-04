/**
 * Unary operator to check the value of a `YesOrNo` field.
 * @param {any} value YesOrNo field value to compare to `Yes`
 * @return {boolean} whether the value was a string equals to `Yes` ignoring the case
 */
export const isYes = (value) => typeof value === 'string' && value.toLowerCase() === 'yes';
