import {search, searchDsl as dsl} from './search';

describe('search', () => {
  test('should perform search', async () => {
    const resData = {
      total: {count: 2, pages: 1},
      page: {index: 1, size: 25},
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

  test('should perform search with parameters', async () => {
    const resData = {
      total: {count: 2, pages: 1},
      page: {index: 1, size: 25},
      results: [
        {}, {}
      ],
    };

    const httpStub = {
      post: (url, body, params) => {
        expect(url).toEqual('/case-types/CaseType1/cases/search');
        expect(body).toEqual({
          query: 'criteria',
          sort: 'order',
          page: 'limit',
        });
        expect(params).toEqual({
          filter: 'test',
        });
        return Promise.resolve({data: resData});
      },
    };

    const data = await search(httpStub)('CaseType1')({query: 'criteria'})({sort: 'order'})({page: 'limit'}, {filter: 'test'});

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

  test('should return `equalsIgnoreCase` matcher', () => {
    const equalsIgnoreCase = dsl.equalsIgnoreCase('field1', 'value1');
    expect(equalsIgnoreCase).toEqual({
      equalsIgnoreCase: {
        field: 'field1',
        value: 'value1'
      }
    });
  });

  test('should return `equalsAny` matcher', () => {
    const equalsAny = dsl.equalsAny('field1', ['value1']);
    expect(equalsAny).toEqual({
      equalsAny: {
        field: 'field1',
        value: ['value1']
      }
    });
  });

  test('should return `equalsAnyIgnoreCase` matcher', () => {
    const equalsAnyIgnoreCase = dsl.equalsAnyIgnoreCase('field1', ['value1']);
    expect(equalsAnyIgnoreCase).toEqual({
      equalsAnyIgnoreCase: {
        field: 'field1',
        value: ['value1']
      }
    });
  });

  test('should return `hasValue` matcher', () => {
    const hasValue = dsl.hasValue('field1', true);
    expect(hasValue).toEqual({
      hasValue: {
        field: 'field1',
        value: true
      }
    });
  });

  test('should return `dateRange` matcher', () => {
    const dateRange = dsl.dateRange('field1', dsl.fromToDate('2010-01-01', '2020-01-01'));
    expect(dateRange).toEqual({
      dateRange: {
        field: 'field1',
        value: {
          from: '2010-01-01',
          to: '2020-01-01'
        }
      }
    });
  });

  test('should return `contains` matcher for collection field', () => {
    const contains = dsl.contains('field1', dsl.collectionItem('field2', 'value2'));
    expect(contains).toEqual({
      contains: {
        field: 'field1',
        value: {
          field: 'field2',
          value: 'value2'
        }
      }
    });
  });

  test('should return `contains` matcher for multi-select field', () => {
    const contains = dsl.contains('field1', 'value1');
    expect(contains).toEqual({
      contains: {
        field: 'field1',
        value: 'value1'
      }
    });
  });

  test('should return `is` matcher', () => {
    const is = dsl.is('field1', false);
    expect(is).toEqual({
      is: {
        field: 'field1',
        value: false
      }
    });
  });

  test('should return `not` matcher', () => {
    const not = dsl.not({equals: 'equals1'});
    expect(not).toEqual({
      not: {equals: 'equals1'}
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

  test('should return fromToDate', () => {
    const fromToDate = dsl.fromToDate('2010-01-01', '2020-01-01');
    expect(fromToDate).toEqual({
      from: '2010-01-01',
      to: '2020-01-01',
    });
  });

  test('should return collectionItem', () => {
    const collectionItem = dsl.collectionItem('field1', 'value1');
    expect(collectionItem).toEqual({
      field: 'field1',
      value: 'value1',
    });
  });

  test('should return constructed path to data field', () => {
    expect(dsl.data('field1')).toEqual('data.field1');
    expect(dsl.data('level1.level2')).toEqual('data.level1.level2');
    expect(dsl.data('level1', 'level2')).toEqual('data.level1.level2');
    expect(dsl.data(...['level1', 'level2'])).toEqual('data.level1.level2');
  });

  test('should return computed field prefixed with identifier', () => {
    expect(dsl.computedField('computedField')).toEqual(':computedField');
  })

  test('should return `greaterThan` matcher', () => {
    const greaterThan = dsl.greaterThan('field1', 1);
    expect(greaterThan).toEqual({
      greaterThan: {
        field: 'field1',
        value: 1
      }
    });
  });

  test('should return `greaterThanOrEquals` matcher', () => {
    const greaterThanOrEquals = dsl.greaterThanOrEquals('field1', 1);
    expect(greaterThanOrEquals).toEqual({
      greaterThanOrEquals: {
        field: 'field1',
        value: 1
      }
    });
  });

  test('should return `lessThan` matcher', () => {
    const lessThan = dsl.lessThan('field1', 1);
    expect(lessThan).toEqual({
      lessThan: {
        field: 'field1',
        value: 1
      }
    });
  });

  test('should return `lessThanOrEquals` matcher', () => {
    const lessThanOrEquals = dsl.lessThanOrEquals('field1', 1);
    expect(lessThanOrEquals).toEqual({
      lessThanOrEquals: {
        field: 'field1',
        value: 1
      }
    });
  });

  test('should return `lessThanOrEquals` matcher for field to field comparison', () => {
    const lessThanOrEquals = dsl.lessThanOrEquals('field1', dsl.compareToField('field2'));
    expect(lessThanOrEquals).toEqual({
      lessThanOrEquals: {
        field: 'field1',
        value: {
          field: 'field2',
        }
      }
    });
  });
});

describe('searchParams', () => {
  test('should build search parameter for links', () => {
    const params = dsl.searchParams().withLinks().build();
    expect(params).toEqual({
      ['with-links']: 'true'
    });
  });

  test('should build search parameter for a single computed field', () => {
    const params = dsl.searchParams().withComputedFields('computedField1').build();
    expect(params).toEqual({
      ['computed-fields']: 'computedField1',
    });
  });

  test('should build search parameter for multiple computed fields', () => {
    const params = dsl.searchParams().withComputedFields('computedField1', 'computedField2').build();
    expect(params).toEqual({
      ['computed-fields']: 'computedField1,computedField2',
    });
  });

  test('should not build search parameter for computed fields when none are provided', () => {
    const params = dsl.searchParams().withComputedFields().build();
    expect(params).toEqual({});
  });

  test('should build search parameters for provided additional parameters', () => {
    const params = dsl.searchParams({param1: 'test'})
      .withLinks()
      .withComputedFields('computedField1')
      .build();
    expect(params).toEqual({
      param1: 'test',
      ['with-links']: 'true',
      ['computed-fields']: 'computedField1',
    });
  });
});
