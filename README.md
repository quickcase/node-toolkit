# node-toolkit
[![Build status](https://github.com/quickcase/node-toolkit/workflows/check-master/badge.svg)](https://github.com/quickcase/node-toolkit/actions)

NodeJS toolkit for QuickCase.

## Installing

```bash
npm i @quickcase/node-toolkit
```

## Toolkit API

* [Cache](#cache)
* [Case](#case)
* [Case Access](#case-access)
* [Definition](#definition)
* [Document](#document)
* [Field](#field)
* [HTTP Client](#http-client)
* [OAuth2](#oauth2)
* [Search](#search)
* [Redis Gateway](#redis-gateway)

### Cache

#### useCache(config)

Creates a new cache instance.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| config | object| Optional. Caching configuration |

`config`:
* `ttlMs`: Number. Time-to-live for cache in milliseconds, defaults to 30000 (30s)

##### Returns

`Array` with getter and setter functions for cache.

#### Example

```javascript
import {useCache} from '@quickcase/node-toolkit';

const [getValue, setValue] = useCache({ttlMs: 5 * 1000});

setValue('key')('someValue');

const value = getValue('key'); // value = 'someValue'
```

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

#### idTo36(identifier)

Encode case identifier to a base36 string representation.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| identifier | number or string | Required. Case Identifier|

##### Returns

`base36 string` representing case identifier.

#### Example

```javascript
import {idTo36} from '@quickcase/node-toolkit';

idTo36('1583178988495195') // > 0fl6udxa2qj
```

#### idFrom36(base36String)

Decode case identifier from a base36 string representation.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| base36String | string | Required. base36 string representing Case Identifier|

##### Returns

`string` - case identifier converted from base36 string

#### Example

```javascript
import {idFrom36} from '@quickcase/node-toolkit';

idFrom36('0fl6udxa2qj') // > '1583178988495195'
```

#### isCaseIdentifier36(base36String)

Validate if base36 string is a valid representation of a case identifier.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| base36String | string | Required. base36 string representing Case Identifier|

##### Returns

`true` - when base36 string is a valid case identifier; `false` otherwise

#### Example

```javascript
import {isCaseIdentifier36} from '@quickcase/node-toolkit';

isCaseIdentifier36('0fl6udxa2qj') // > true if the base36 string is a valid case identifier
isCaseIdentifier36('xa2qj') // > false if the base36 string is not a valid case identifier
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

#### revokeGroupAccess(httpClient)(caseId)(groupId)

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

#### revokeUserAccess(httpClient)(caseId)(userId)

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

### Definition

#### fetchCaseType(httpClient)(caseTypeId)()

Fetch a case type definition from QuickCase Definition Store.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| httpClient | object | Required. A configured, ready-to-use HTTP client from `@quickcase/node-toolkit` |
| caseTypeId | string | Required. ID of the case type definition to fetch |

##### Returns

`Promise` resolved with case type definition.

#### Example

```javascript
import {fetchCaseType, httpClient} from '@quickcase/node-toolkit';

// A configured `httpClient` is required to get a document
const client = httpClient('http://definition-store:4451')(() => Promise.resolve('access-token'));

const caseType = await fetchCaseType(client)('caseType1')();
/*
caseType:
{
  acls: [],
  case_fields: [],
  ...
}  
*/
```

### Document

#### createDocument(httpclient)(metadata)

Creates a new document upload URL.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| httpClient | object | Required. A configured, ready-to-use HTTP client from `@quickcase/node-toolkit` |
| metadata | object | Required. Document metadata, will be used for access control. See below |

`metadata`:
* `organisation`: String. Organisation ID
* `caseType`: String. Case type ID
* `field`: String. ID of a root field, or path to a nested field (eg. `parent.field1`)

##### Returns

`Promise` resolved with document upload.

#### Example

```javascript
import {createDocument, httpClient} from '@quickcase/node-toolkit';

// A configured `httpClient` is required to create a document
const client = httpClient('http://document-store:3333')(() => Promise.resolve('access-token'));

const metadata = {
  organisation: 'org1',
  caseType: 'caseType1',
  field: 'field1',
};
const docUpload = await createDocument(client)(metadata);
/*
docUpload:
{
  id: '123-123-123',
  upload_url: 'http://upload-url',
}  
*/
```

#### getDocument(httpclient)(docId)

Get a document download URL.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| httpClient | object | Required. A configured, ready-to-use HTTP client from `@quickcase/node-toolkit` |
| docId | string | Required. ID of the document to download |

##### Returns

`Promise` resolved with document download.

#### Example

```javascript
import {getDocument, httpClient} from '@quickcase/node-toolkit';

// A configured `httpClient` is required to get a document
const client = httpClient('http://document-store:3333')(() => Promise.resolve('access-token'));

const docDownload = await getDocument(client)('123-123-123');
/*
docDownload:
{
  id: '123-123-123',
  download_url: 'http://download-url',
}  
*/
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

#### defaultUserInfoRetriever(config)(accessToken)

Retrieve the user claims from an OIDC provider `/userInfo` endpoint.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| config | object | Required. Configuration (see below) |
| accessToken | string | Required. Access token for which user info should be retrieved |

`config`:
* `userInfoUri`: Required. URI of OIDC provider's `/userInfo` endpoint

##### Returns

`Promise` resolved with the user claims.

##### Example

```javascript
import {defaultUserInfoRetriever} from '@quickcase/node-toolkit';

const config = {jwksUri: 'http://idam/oidc/userInfo'};
const userClaims = await defaultUserInfoRetriever(config)('accessToken123');
/*
userClaims:
{
  "sub": "...",
  ...
}
*/
```

#### exchangeOAuth2Code(config)(redirectUri)(code)

Provided a valid OAuth2 code, exchange it for a full set of tokens in the context of an OIDC/OAuth2 authorization code grant.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| config | object | Required. Configuration (see below) |
| redirectUri | string | Required. Redirect URI used to generate the OAuth2 code |
| code | string | Required. OAuth2 code generated as part of user authorisation step |

`config`:
* `tokenEndpoint`: URL of the OAuth2 `/token` endpoint on the IDAM server
* `clientId`: OAuth2 client ID
* `clientSecret`: OAuth2 client secret

##### Returns

`Promise` resolved with a valid set of tokens

##### Example

```javascript
import {exchangeOAuth2Code} from '@quickcase/node-toolkit';

const config = {
  clientId: 'string',
  clientSecret: 'string',
  tokenEndpoint: 'string',
};

const tokens = await exchangeOAuth2Code(config)('http://redirect-uri')('code123');

/*
tokens:
{
  "access_token": "...",
  "id_token": "...",
  "expires_in": 300, // seconds
  "refresh_token": "...",
  "refresh_expires_in": 1800, // seconds
}
*/
```

#### JwtKeySupplier

##### cachedJwtKeySupplier(config)(jwtKeySupplier)(jwtHeader)

Decorates a `jwtKeySupplier` to add caching per `kid`.

###### Arguments

| Name | Type | Description |
|------|------|-------------|
| config | object | Optional. Cache configuration, see `Cache: useCache(config)` |
| jwtKeySupplier | JwtKeySupplier | Required. Decorated instance |
| jwtHeader | object | Required. Header of JWT token with `kid` property |

###### Returns

`Promise` resolved with signing key for given `jwtHeader`.

###### Example

```javascript
import {cachedJwtKeySupplier} from '@quickcase/node-toolkit';

const config = {
  ttlMs: 5 * 1000,
};
const jwtKeySupplier = (jwtHeader) => Promise.resolve('signingKey');

const signingKey = await cachedJwtKeySupplier(config)(jwtKeySupplier)({kid: 'key123'});
// signingKey: '...'
```

##### defaultJwtKeySupplier(config)(jwtHeader)

Use `jwks-rsa` to retrieve signing key from a JWKS endpoint.

###### Arguments

| Name | Type | Description |
|------|------|-------------|
| config | object | Required. Object with `jwksUri` property |
| jwtHeader | object | Required. Header of JWT token with `kid` property |

###### Returns

`Promise` resolved with signing key for given `jwtHeader`.

###### Example

```javascript
import {defaultJwtKeySupplier} from '@quickcase/node-toolkit';

const config = {
  jwksUri: 'https://idam/oidc/.well-known/jwks.json',
};

const signingKey = await defaultJwtKeySupplier(config)({kid: 'key123'});
// signingKey: '...'
```

#### JwtVerifier

##### defaultJwtVerifier(jwtKeySupplier)(jwtToken)

Use `jsonwebtoken` to verify JWT token and extract payload.

###### Arguments

| Name | Type | Description |
|------|------|-------------|
| jwtKeySupplier | JwtKeySupplier | Required. Instance of a JWT key supplier to verify signature |
| jwtToken | string | Required. JWT token to verify |

###### Returns

`Promise` resolved with payload of `jwtToken` when token verified (signature and expiry). `Promise` rejected if `jwtToken` couldn't be verified.

###### Example

```javascript
import {defaultJwtVerifier} from '@quickcase/node-toolkit';

const jwtKeySupplier = (jwtHeader) => Promise.resolve('signingKey');

const payload = await defaultJwtVerifier(jwtKeySupplier)('eyJhbGciOiJIUzI1NiIsInR...UuqlnuQ');
/*
payload:
{
  "sub": "...",
  "exp": "...",
  ...
}
*/
```

#### refreshOAuth2Tokens(config)(refreshToken)

Provided a valid OAuth2 refresh token, exchange it for a full set of tokens.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| config | object | Required. Configuration (see below) |
| refreshToken | string | Required. Valid refresh token issued as part of an OAuth2 flow |

`config`:
* `tokenEndpoint`: URL of the OAuth2 `/token` endpoint on the IDAM server
* `clientId`: OAuth2 client ID
* `clientSecret`: OAuth2 client secret

##### Returns

`Promise` resolved with a valid set of tokens

##### Example

```javascript
import {refreshOAuth2Tokens} from '@quickcase/node-toolkit';

const config = {
  clientId: 'string',
  clientSecret: 'string',
  tokenEndpoint: 'string',
};

const tokens = await refreshOAuth2Tokens(config)('refresh123');

/*
tokens:
{
  "access_token": "...",
  "id_token": "...",
  "expires_in": 300, // seconds
  "refresh_token": "...",
  "refresh_expires_in": 1800, // seconds
}
*/
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

### Redis Gateway

#### publishBatchMessage(config)(options)

Publish a batch message into Redis.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| config | object| Required. Redis configuration object |
| options | object | Required. Properties of the batch message, values should be string  |

config object properties
Configuration properties for the Redis.
| Name | Type | Description |
|------|------|-------------|
| host | String | Redis server host (ex : 127.0.0.1) |
| port | String | Redis server port (6379) |
| password | String | Redis password |

options object properties

| Name | Type | Description |
|------|------|-------------|
| callerReference | String | Required. Redis configuration object |
| jobs | String | Required. Array of jobItem object |
| notifyUrl | String | Required. Callback url to notify caller when batch is completed |

jobItem object properties

| Name | Type | Description |
|------|------|-------------|
| caseType | String | Required. Redis configuration object |
| events | Array | Required. Array of event objects to be triggered by batch process  {event : '#Case Event',type : [create|update]} |
| payload | object | Payload of the case event which will be triggered |
| index | Number | Index of the jobItem within the jobs |
| failRetryCount | Number | fail the event after retry count attempt |

##### Returns

`Promise` resolved when batch message successfully put into Redis.

#### Example

```javascript
import {publishBatchMessage} from '@quickcase/node-toolkit';

const config = {host: 'redisHost', port: 'redisPort', password: 'pass'};
const jobItem = {
    caseType: 'Application',
    events: [{event: 'create', type: 'create',reference: null}],   
    payload: '# Case Event Payload',
    index: index,
    failCount: 3
};

const options = {
    callerReference: '#Case Reference',
    jobs: JSON.stringify([jobItem]),
    notifyUrl: '#webhooks-notify-url'
};

publishBatchMessage(config)(options)
    .then(console.log)
    .catch(console.error);
/*
["OK"]
*/
```
