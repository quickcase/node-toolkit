# node-toolkit
[![Build status](https://github.com/quickcase/node-toolkit/workflows/check-master/badge.svg)](https://github.com/quickcase/node-toolkit/actions)

NodeJS toolkit for QuickCase.

## Installing

```bash
npm i @quickcase/node-toolkit
```

## Toolkit API

* [Case](#case)
* [HTTP Client](#http-client)
* [Search](#search)

### Case

#### fieldExtractor(aCase)(path)

Extract the value of a field from the given case.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| aCase | object | Required. A case object as returned by QuickCase's Data Store |
| path | string | Required. Path to a field, expressed using object notation |

##### Returns

Value of the specified field; or `undefined` if path cannot be found in case data.

#### Example

```javascript
import {fieldExtractor} from '@quickcase/node-toolkit';

const aCase = {
  id: '1234123412341234',
  state: 'Open',
  data: {
    complex1: { field1: 'value1' },
    field2: 'value2',
  }
};

// Prepare fields for extraction
const fields = fieldExtractor(aCase);
// Extract
const field1 = fields('complex1.field1');
const field2 = fields('field2');
```

### HTTP Client

#### httpClient(baseUrl)(accessTokenProvider)

Create a configured instance of an HTTP client, based on [Axios](https://github.com/axios/axios).

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| baseUrl | string| Required. Base URL to use for HTTP requests |
| accessTokenProvider | function | Required. Function returning a `Promise` resolved with a valid access token |

##### Returns

Configured HTTP client instance.

```javascript
{
  get: (relativeUrl) => Promise<Axios.Response>,
  post: (relativeUrl, body) => Promise<Axios.Response>,
}
```

### Search

Search cases for a given case type using QuickCase's Data Store Search API v2.

#### search(httpClient)(caseType)(query)(sort)(page)

Execute a search query.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| httpClient | object| Required. A configured, ready-to-use HTTP client from `@quickcase/node-toolkit` |
| caseType | string| Required. Identifier of the case type targeted by the search query |
| query | object | Required. Query as per Search API v2 contract; see **search DSL** below for helpers |
| sort | object | Optional. Sorting instructions as per Search API v2 contract; see **search DSL** below for helpers |
| page | object | Optional. Paging instructions as per Search API v2 contract; see **search DSL** below for helpers |

##### Returns

`Promise` resolved with the payload of the successful search response.

```javascript
Promise.resolve({
  total: { count: 0, pages: 0 },
  page: { index: 0, size: 25 },
  results: []
});
```

#### search DSL

A domain-specific language to help build search queries.

##### query(...criteria)

Build the top-level `query` object by composing one or many criteria.

##### and(...criteria)

Combine multiple criteria with the `AND` operator.

##### or(...criteria)

Combine multiple criteria with the `OR` operator.

##### equals(field, value)

Build a criterion matching on exactly equal values for given field.
Dynamic field names must be prefixed with `data.`.

##### sort(...instructions)

Build the top-level `sort` object by combining one or many sorting instructions.

Priority of sorting instructions is based on the order of the instructions.

##### sortAsc(field)

Create an ascending sort instruction for the given field.
Dynamic field names must be prefixed with `data.`.

##### sortDesc(field)

Create a descending sort instruction for the given field.
Dynamic field names must be prefixed with `data.`.

##### page(index, size)

Build the top-level `page` object.

* `index` is the number of the results page to retrieve and starts at `1`
* `size` is the maximum number of results to retrieve per page and is capped at `100`

#### Example

```javascript
import {httpClient, search, searchDsl as s} from '@quickcase/node-toolkit';

// A configured `httpClient` is required by search
const searchClient = httpClient('http://data-store:4452')(() => Promise.resolve('access-token'));

const query = s.query(
  s.and(
    s.equals('state', 'STATE_1'),
    s.equals('data.field1', 'fooBar'),
  )
);

const sort = s.sort(
  s.sortAsc('state'),
  s.sortDesc('dara.field1'),
)

const page = s.page(1, 30);

const response = await search(searchClient)('CaseType1')(query)(sort)(page);
```
