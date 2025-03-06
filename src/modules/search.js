/*
 * Search
 */

 export const search = (http) => (caseTypeId) => (query) => (sort) => async (page, params) => {
   const url = `/case-types/${caseTypeId}/cases/search`;
   const body = {
     ...query,
     ...sort,
     ...page,
   };
   const res = await http.post(url, body, params);
   return res.data;
 };

/*
 * Search DSL
 */

const query = (...criteria) => ({
  query: Object.assign({}, ...criteria),
});

const matcher = (matcherName) => (field, value) => ({
  [matcherName]: {field, value},
});

const equals = matcher('equals');
const equalsIgnoreCase = matcher('equalsIgnoreCase');
const equalsAny = matcher('equalsAny');
const equalsAnyIgnoreCase = matcher('equalsAnyIgnoreCase');
const hasValue = matcher('hasValue');
const dateRange = matcher('dateRange');
const contains = matcher('contains');
const is = matcher('is');
const greaterThan = matcher('greaterThan');
const greaterThanOrEquals = matcher('greaterThanOrEquals');
const lessThan = matcher('lessThan');
const lessThanOrEquals = matcher('lessThanOrEquals');

const and = (...criteria) => ({
  and: criteria,
});

const not = (criteria) => ({
  not: criteria,
});

const or = (...criteria) => ({
  or: criteria,
});

const page = (index, size) => ({
  page: {
    ...(index) && {index},
    ...(size) && {size},
  }
});

/**
 * Build object notation used by search criteria for data fields.
 * @param {Array.<string>} fields Field names to use to build the object notation for the field path
 * @return {string} Fully-qualified object notation for the data field
 */
const data = (...fields) => 'data.' + fields.join('.');

const sort = (...args) => ({
  sort: args,
});

const sortAsc = (field) => ({
  field,
  direction: 'asc',
});

const sortDesc = (field) => ({
  field,
  direction: 'desc',
});

const fromToDate = (date1, date2) => ({
  from: date1,
  to: date2
});

const collectionItem = (field, value) => ({
  field, value
});

/**
 * Build value as field in field to field comparison. Can only be used in context of value for a given querydsl.
 * @param field - field name to compare with
 * @returns {{field}} object representing field to be compared
 */
const compareToField = (field) => ({
  field,
});

/**
 * Return field name with a prefix to identify a computed field in querydsl
 * @param computedFieldName - computed field name
 * @returns {String} field name prefixed with identifier for computed field
 */
const computedField = (computedFieldName) => ':' + computedFieldName;

/**
 * Build optional search request parameters
 * @param additionalParams - optional additional parameters to be included in the search query parameters
 * @returns object with optional parameters to build
 */
const searchParams = (additionalParams) => {
  const params = {...additionalParams};
  return {
    withLinks: function () {
      Object.assign(params, {['with-links']: 'true'});
      return this;
    },
    withComputedFields: function (...computedFields) {
      if (computedFields?.length > 0) {
        Object.assign(params, {['computed-fields']: computedFields.join(',')});
      }
      return this;
    },
    build: function () {
      return params;
    },
  }
};

export const searchDsl = Object.freeze({
  not,
  and,
  compareToField,
  computedField,
  data,
  equals,
  equalsIgnoreCase,
  equalsAny,
  equalsAnyIgnoreCase,
  hasValue,
  dateRange,
  contains,
  is,
  greaterThan,
  greaterThanOrEquals,
  lessThan,
  lessThanOrEquals,
  page,
  query,
  or,
  searchParams,
  sort,
  sortAsc,
  sortDesc,
  fromToDate,
  collectionItem,
});
