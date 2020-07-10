/*
 * Search
 */

 export const search = (http) => (caseTypeId) => (query) => (sort) => async (page) => {
   const url = `/case-types/${caseTypeId}/cases/search`;
   const body = {
     ...query,
     ...sort,
     ...page,
   };
   const res = await http.post(url, body);
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

const and = (...criteria) => ({
  and: criteria,
});

const not = (...criteria) => ({
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

export const searchDsl = Object.freeze({
  not,
  and,
  equals,
  equalsIgnoreCase,
  equalsAny,
  equalsAnyIgnoreCase,
  hasValue,
  dateRange,
  contains,
  is,
  page,
  query,
  or,
  sort,
  sortAsc,
  sortDesc,
  fromToDate,
  collectionItem,
});
