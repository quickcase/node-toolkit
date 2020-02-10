# node-toolkit
[![Build status](https://github.com/quickcase/node-toolkit/workflows/check-master/badge.svg)](https://github.com/quickcase/node-toolkit/actions)

NodeJS toolkit for QuickCase.

## Installing

```bash
npm i @quickcase/node-toolkit
```

## Toolkit API

* [Case](#case)
* [Case Access](#case-access)
* [Field](#field)
* [HTTP Client](#http-client)
* [OAuth2](#oauth2)
* [Search](#search)

### Case

#### fetchCase(httpClient)(caseId)()

Fetch a case from QuickCase Data Store.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| httpClient | object| Required. A configured, ready-to-use HTTP client from `@quickcase/node-toolkit` |
| caseId | string | Required. 16-digit unique case identifier |

##### Returns

`Promise` resolved with the case matching the given identifier.

#### Example

```javascript
import {fetchCase, httpClient} from '@quickcase/node-toolkit';

// A configured `httpClient` is required to fetch case
const client = httpClient('http://data-store:4452')(() => Promise.resolve('access-token'));

const aCase = await fetchCase(client)('1234123412341238')();
/*
{
  id: '1234123412341238',
  state: 'Active',
  data: {...},
  ...
}
*/
```

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

#### isCaseIdentifier(identifier)

Validate that a string or number is a valid QuickCase identifier.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| identifier | number|string | Required. Identifier to validate |

##### Returns

`true` when identifier is valid (16 digits with correct check digit); `false` otherwise.

#### Example

```javascript
import {isCaseIdentifier} from '@quickcase/node-toolkit';

isCaseIdentifier('1234') // > false - Not 16 digits
isCaseIdentifier('1234123412341234') // > false - Incorrect check digit
isCaseIdentifier('1234123412341238') // > true - Correct check digit
```

### Case Access

#### grantGroupAccess(httpClient)(caseId)(groupId)(...caseRoles)

Grant access to a case to a group.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| httpClient | object| Required. A configured, ready-to-use HTTP client from `@quickcase/node-toolkit` |
| caseId | string | Required. 16-digit unique case identifier |
| groupId | string | Required. Group identifier |
| caseRoles | ...string | At least one required. Case roles to be granted to the user for the given case. **Please note:** Case roles must be between square brackets |

##### Returns

`Promise` resolved when permissions updated.

#### Example

```javascript
import {grantGroupAccess, httpClient} from '@quickcase/node-toolkit';

// A configured `httpClient` is required to update case permissions
const client = httpClient('http://data-store:4452')(() => Promise.resolve('access-token'));

await grantGroupAccess(client)('1234123412341238')('group-1')('[CREATOR]', '[OWNER]');
```

#### grantUserAccess(httpClient)(caseId)(userId)(...caseRoles)

Grant access to a case to a user.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| httpClient | object| Required. A configured, ready-to-use HTTP client from `@quickcase/node-toolkit` |
| caseId | string | Required. 16-digit unique case identifier |
| userId | string | Required. Unique user identifier, from `sub` claim |
| caseRoles | ...string | At least one required. Case roles to be granted to the user for the given case. **Please note:** Case roles must be between square brackets |

##### Returns

`Promise` resolved when permissions updated.

#### Example

```javascript
import {grantUserAccess, httpClient} from '@quickcase/node-toolkit';

// A configured `httpClient` is required to update case permissions
const client = httpClient('http://data-store:4452')(() => Promise.resolve('access-token'));

await grantUserAccess(client)('1234123412341238')('user-1')('[CREATOR]', '[OWNER]');
```

#### revokeGroupAccess(httpClient)(caseId)(groupId)(...caseRoles)

Revoke access to a case from a group.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| httpClient | object| Required. A configured, ready-to-use HTTP client from `@quickcase/node-toolkit` |
| caseId | string | Required. 16-digit unique case identifier |
| groupId | string | Required. Group identifier |

##### Returns

`Promise` resolved when permissions updated.

#### Example

```javascript
import {revokeGroupAccess, httpClient} from '@quickcase/node-toolkit';

// A configured `httpClient` is required to update case permissions
const client = httpClient('http://data-store:4452')(() => Promise.resolve('access-token'));

await revokeGroupAccess(client)('1234123412341238')('group-1');
```

#### revokeUserAccess(httpClient)(caseId)(userId)(...caseRoles)

Revoke access to a case from a user.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| httpClient | object| Required. A configured, ready-to-use HTTP client from `@quickcase/node-toolkit` |
| caseId | string | Required. 16-digit unique case identifier |
| userId | string | Required. Unique user identifier, from `sub` claim |

##### Returns

`Promise` resolved when permissions updated.

#### Example

```javascript
import {revokeUserAccess, httpClient} from '@quickcase/node-toolkit';

// A configured `httpClient` is required to update case permissions
const client = httpClient('http://data-store:4452')(() => Promise.resolve('access-token'));

await revokeUserAccess(client)('1234123412341238')('user-1');
```

### Field

#### isNo(value)

Check the value of a `YesOrNo` field.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| value | any | Required. The value to compare against `No` ignoring case |

##### Returns

`true` if the field matched `No` ignoring case; `false` otherwise.

#### Example

```javascript
import {isNo} from '@quickcase/node-toolkit';

isNo('No'); // true
isNo('no'); // true
isNo(null); // false
isNo('Yes'); // false
```

#### isYes(value)

Check the value of a `YesOrNo` field.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| value | any | Required. The value to compare against `Yes` ignoring case |

##### Returns

`true` if the field matched `Yes` ignoring case; `false` otherwise.

#### Example

```javascript
import {isYes} from '@quickcase/node-toolkit';

isYes('Yes'); // true
isYes('yes'); // true
isYes(null); // false
isYes('No'); // false
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
  put: (relativeUrl, body) => Promise<Axios.Response>,
}
```

### OAuth2

#### clientAccessTokenProvider(config)()

Provides a valid OAuth2 client access token as per OAuth2's client credentials flow. This is used for Service-to-Service authentication.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| config | object | Required. Configuration (see below) |

`config`:
* `cacheTtl`: Number. Time-to-live for cache in seconds, defaults to 60
* `tokenEndpoint`: URL of the OAuth2 `/token` endpoint on the IDAM server
* `clientId`: OAuth2 client ID
* `clientSecret`: OAuth2 client secret

##### Returns

`Promise` resolved with a valid access token, either from cache or newly generated.

##### Example

```javascript
import {clientAccessTokenProvider} from '@quickcase/node-toolkit';

const tokenProvider = clientAccessTokenProvider({
  cacheTtl: 3600,
  tokenEndpoint: 'https://idam/oauth2/token',
  clientId: 'client',
  clientSecret: 'secret',
});

const accessToken = await tokenProvider();
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

##### contains(field, value)

Build a criterion matching `MultiSelectList` and `Collection` fields which contains the provided value.

`value` can either be a `string` in the case of `MultiSelectList`; or an object built with `collectionItem(field, value)` in the case of a `Collection`.

Dynamic field names must be prefixed with `data.`.

##### dateRange(field, range)

Build a criterion matching `Date` and `DateTime` fields within a given range.
`range` is an object build with `fromToDate(from, to)`.
Dynamic field names must be prefixed with `data.`.

##### equals(field, value)

Build a criterion matching on exactly equal values for given field.
Dynamic field names must be prefixed with `data.`.

##### equalsIgnoreCase(field, value)

Similar to `equals(field, value)`, but case-insensitive.

##### equalsAny(field, values)

Build a criterion matching exactly anyone of the provided values.
Dynamic field names must be prefixed with `data.`.

##### equalsAnyIgnoreCase(field, values)

Similar to `equalsAny(field, values)`, but case-insensitive.

##### hasValue(field, boolean)

Build a criterion matching fields that have a value (`true`) or don't have a value (`false`).
Dynamic field names must be prefixed with `data.`.

##### is(field, boolean)

Build a criterion matching `YesOrNo` fields that are either `true` or `false`.
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
    s.contains('data.multiSelectField', 'VALUE_1'),
    s.contains('data.collectionField', s.collectionItem('subfield1', 'value1')),
    s.dateRange('data.dateField', s.fromToDate('2020-01-01', '2020-01-31')),
    s.equals('state', 'STATE_1'),
    s.equalsIgnoreCase('data.field1', 'fooBar'),
    s.equalsAny('data.field2', ['VALUE_1', 'VALUE_2']),
    s.equalsAnyIgnoreCase('data.field2', ['value_1', 'value_2']),
    s.hasValue('data.field3', true),
    s.is('data.yesOrNoField', true),
  )
);

const sort = s.sort(
  s.sortAsc('state'),
  s.sortDesc('data.field1'),
)

const page = s.page(1, 30);

const response = await search(searchClient)('CaseType1')(query)(sort)(page);
```
