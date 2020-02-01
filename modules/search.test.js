import {search, searchDsl as dsl} from './search';

describe('search', () => {
  test('should perform search', async () => {
    const resData = {
      total: { count: 2, pages: 1 },
      page: { index: 1, size: 25 },
      results: [
        {}, {}
      ],
    };

    const httpStub = {
      post: (url, body) => {
        expect(url).toEqual('/case-types/CaseType1/cases/search');
        expect(body).toEqual({
          query: 'criteria',
          sort: 'order',
          page: 'limit',
        });
        return Promise.resolve({data: resData});
      },
    };

    const data = await search(httpStub)('CaseType1')({query: 'criteria'})({sort: 'order'})({page: 'limit'});

    expect(data).toEqual(resData);
  });
});

describe('searchDsl', () => {
  test('should return query', () => {
    const query = dsl.query({and: 'and'}, {or: 'or'});
    expect(query).toEqual({
      query: {
        and: 'and',
        or: 'or',
      }
    });
  });

  test('should return `equals` matcher', () => {
    const equals = dsl.equals('field1', 'value1');
    expect(equals).toEqual({
      equals: {
        field: 'field1',
        value: 'value1'
      }
    });
  });

  test('should return `and` matcher', () => {
    const and = dsl.and({equals: 'equals1'}, {equals: 'equals2'});
    expect(and).toEqual({
      and: [
        {equals: 'equals1'},
        {equals: 'equals2'}
      ]
    });
  });

  test('should return `or` matcher', () => {
    const or = dsl.or({equals: 'equals1'}, {equals: 'equals2'});
    expect(or).toEqual({
      or: [
        {equals: 'equals1'},
        {equals: 'equals2'}
      ]
    });
  });

  test('should return page', () => {
    expect(dsl.page(2, 50)).toEqual({
      page: {
        index: 2,
        size: 50,
      }
    });
  });

  test('should return sort', () => {
    const sort = dsl.sort({sortAsc: 'field1'}, {sortDesc: 'field2'});
    expect(sort).toEqual({
      sort: [
        {sortAsc: 'field1'},
        {sortDesc: 'field2'}
      ]
    });
  });

  test('should return sortAsc', () => {
    const sortAsc = dsl.sortAsc('field1');
    expect(sortAsc).toEqual({
      field: 'field1',
      direction: 'asc',
    });
  });

  test('should return sortDesc', () => {
    const sortDesc = dsl.sortDesc('field1');
    expect(sortDesc).toEqual({
      field: 'field1',
      direction: 'desc',
    });
  });
});
