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

const equals = (field, value) => ({
  equals: {field, value},
});

const and = (...criteria) => ({
  and: criteria,
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

export const searchDsl = Object.freeze({
  and,
  equals,
  page,
  query,
  or,
  sort,
  sortAsc,
  sortDesc,
});
