# node-toolkit
[![CI](https://github.com/quickcase/node-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/quickcase/node-toolkit/actions/workflows/ci.yml)
![npm (scoped)](https://img.shields.io/npm/v/@quickcase/node-toolkit)

NodeJS toolkit for QuickCase.

## Installing

```bash
npm i @quickcase/node-toolkit
```

## Toolkit API

* [Cache](#cache)
* [Case](#case)
* [Case Access](#case-access)
* [Config](#config)
* [Definition](#definition)
* [Document](#document)
* [Express](#express)
* [Field](#field)
* [HTTP Client](#http-client)
* [OAuth2](#oauth2)
* [Redis Gateway](#redis-gateway)
* [Search](#search)
* [Test](#test)

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

#### createCase(httpClient)(caseTypeId)(eventId)(payload)

Create a new case in QuickCase Data Store.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| httpClient | object| Required. A configured, ready-to-use HTTP client from `@quickcase/node-toolkit` |
| caseTypeId | string | Required. Unique case type identifier |
| eventId | string | Required. Unique event trigger identifier to use for creation |
| payload | description | Optional. Case data and event description |

`payload`:
* `data`: Optional object formed of key/value pairs of case fields for the new case
* `summary`: Optional short sentence justifying the case creation
* `description`: Optional longer explanation of the case creation

##### Returns

`Promise` resolved with the newly created case.

#### Example

```javascript
import {createCase, httpClient} from '@quickcase/node-toolkit';

// A configured `httpClient` is required to create a case
const client = httpClient('http://data-store:4452')(() => Promise.resolve('access-token'));

const aCase = await createCase(client)('aCaseType')('anEvent')({
  data: {field1: 'value1'},
  summary: 'New case',
});
/*
{
  id: '1234123412341238',
  state: 'Created',
  data: {field1: 'value1'},
  ...
}
*/
```

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
| path | string, Array.<string>, object | Required. One or many paths to a field using object notation. |

##### Returns

* When `path` is a string: Value of the specified field; or `undefined` if path cannot be found in case data.
* When `path` is an array: An array of the same size, with extracted values in the same position as their respective path. Paths not found are extracted as `undefined`.
* When `path` is an object: An object of the same shape, with extracted values in place of the paths. Paths not found are extracted as `undefined`.

#### Example

```javascript
import {fieldExtractor} from '@quickcase/node-toolkit';

const aCase = {
  id: '1234123412341234',
  state: 'Open',
  data: {
    complex1: { field1: 'value1' },
    field2: 'value2',
    collection3: [
      {id: '123', value: {field2: 'value3'}},
      {id: '456', value: {field2: 'value4'}},
    ]
  }
};

// Prepare fields for extraction
const fields = fieldExtractor(aCase);

// Extract single values
const value1 = fields('complex1.field1');
const value2 = fields('field2');

// Extract from collections
const value3 = fields('collection3[0].value.field2'); // By index
const value4 = fields('collection3[id:456].value.field2'); // By id

// Bulk extract as array
const values = fields(['complex1.field1', 'field2', 'field3']);
// ['value1', 'value2', undefined]

// Bulk extract as object
const values = fields({
  value1: 'complex1.field1',
  value2: 'field2',
  value3: 'field3',
});
// {value1: 'value1', value2: 'value2', value3: undefined}
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

#### updateCase(httpClient)(caseId)(eventId)(payload)

Update/progress an existing case in QuickCase Data Store.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| httpClient | object| Required. A configured, ready-to-use HTTP client from `@quickcase/node-toolkit` |
| caseId | string | Required. 16-digit unique case identifier |
| eventId | string | Required. Unique event trigger identifier to use for update |
| payload | description | Optional. Case data and event description |

`payload`:
* `data`: Optional object formed of key/value pairs of case fields to add/edit the case
* `summary`: Optional short sentence justifying the case update
* `description`: Optional longer explanation of the case update

##### Returns

`Promise` resolved with the updated case.

#### Example

```javascript
import {updateCase, httpClient} from '@quickcase/node-toolkit';

// A configured `httpClient` is required to create a case
const client = httpClient('http://data-store:4452')(() => Promise.resolve('access-token'));

const aCase = await updateCase(client)('1583178988495195')('anEvent')({
  data: {field1: 'value1'},
  summary: 'Updated case',
});
/*
{
  id: '1583178988495195',
  state: 'Updated',
  data: {field1: 'value1'},
  ...
}
*/
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

### Config

Utilities to deal with configuration objects.

#### camelConfig(config)

Recursively convert keys in configuration objects to camel case for consistency and ease of use.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| config | object | Required. Object containing the key/value pair of configuration properties. |

##### Returns

`object` with the same shape as `config` but for which all keys are now camel case. Values are preserved unaltered.

#### Example

```javascript
import {camelConfig} from '@quickcase/node-toolkit';

const config = camelConfig({
  'a-prop-2': {
    'a_prop_21': undefined,
    'a-prop-22': 'override21',
  },
});

/*
{
  aProp2: {
    aProp21: 'value21',
    aProp22: 'override21',
  },
}
*/
```

#### mergeConfig(defaultConfig)(overrides)

Deep merge of a default configuration with partial overrides.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| defaultConfig | object| Required. Object representing the entire configuration contract with default values for all properties. Properties which do not have a default value must be explicitly assigned `undefined`. |
| overrides | object | Required. Subset of `defaultConfig`. Overridden properties must exactly match the shape of `defaultConfig` |

##### Returns

`object` with the same shape as `defaultConfig` and containing the merged properties of `defaultConfig` and `overrides`.

#### Example

```javascript
import {mergeConfig} from '@quickcase/node-toolkit';

const DEFAULT_CONFIG = {
  prop1: 'value1',
  prop2: {
    prop21: 'value21',
    prop22: 'value21',
    prop23: 'value23',
  },
  prop3: undefined,
};

const config = mergeConfig(DEFAULT_CONFIG)({
  prop2: {
    prop21: undefined,
    prop22: 'override21',
    prop23: null,
  }
});

/*
{
  prop1: 'value1',
  prop2: {
    prop21: 'value21',
    prop22: 'override21',
    prop23: null,
  },
  prop3: undefined,
}
*/
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
* `filename`: String. Custom name for the file, used to name downloads
* `organisation`: String. Organisation ID
* `caseType`: String. Case type ID
* `case`: String. Case 16-digit reference
* `field`: String. ID of a root field, or path to a nested field (eg. `parent.field1`)

##### Returns

`Promise` resolved with document upload.

#### Example

```javascript
import {createDocument, httpClient} from '@quickcase/node-toolkit';

// A configured `httpClient` is required to create a document
const client = httpClient('http://document-store:3333')(() => Promise.resolve('access-token'));

const metadata = {
  filename: 'someFile.pdf',
  organisation: 'org1',
  caseType: 'caseType1',
  case: '1234123412341238',
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

### Express

Utilities for [ExpressJS](https://expressjs.com/) v4.x.x.

#### middlewareFactory(dependencySuppliers)(middlewareSupplier)(req, res, next)

Decorator for an Express middleware which dynamically instantiates request-based dependencies and underlying middleware upon processing of a request.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| dependencySuppliers | object | Required. Map of named dependency supplier functions which take the request object as an input |
| middlewareSupplier | function | Function that will be passed the initialised dependencies and return an initialised Express middleware. |

##### Returns

ExpressJS middleware function.

##### Example

```js
import {middlewareFactory} from '@quickcase/node-toolkit';
import express from 'express';

const router = express.Router();

const dependencySuppliers = {
  tokenProvider: (req) => () => Promise.resolve(req.accessToken),
  service: (req) => {...},
};

const middlewareSupplier = ({tokenProvider, service}) => (req, res) => {
  // use initialised `tokenProvider` and `service`...
};

router.get('/', middlewareFactory(dependencySuppliers)(middlewareSupplier));
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

#### newCollection(array)

Convert a Javascript array to a QuickCase collection value.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| array | array | Optional. Javascript array to convert to collection value |

##### Returns

Array formatted as a QuickCase collection.

#### Example

```javascript
import {newCollection} from '@quickcase/node-toolkit';

newCollection(); // []
newCollection(['1', '2', '3']); // [{value: '1'},{value: '2'},{value: '3'}]
```

### HTTP Client

#### httpClient(baseUrl, axiosInstance = axios)(accessTokenProvider)

Create a configured instance of an HTTP client, based on [Axios](https://github.com/axios/axios).

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| baseUrl | string | Required. Base URL to use for HTTP requests |
| axiosInstance | Axios | Optional. Custom instance of Axios, created by `axios.create()`. Defaults to global `axios` instance. |
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

#### AccessTokenSupplier

##### cookieAccessTokenSupplier(cookie = 'access_token')(req)

Extract an access token from a cookie on an ExpressJS request.

###### Arguments

| Name | Type | Description |
|------|------|-------------|
| cookie | string | Optional. Name of the cookie, defaults to `access_token` |

###### Returns

`string` containing the access token; `undefined` if not found.

##### headerAccessTokenSupplier(header = 'Authorization')(req)

Extract an access token from a header on an ExpressJS request.
The header value must comply to pattern `Bearer <accessToken>`.

###### Arguments

| Name | Type | Description |
|------|------|-------------|
| header | string | Optional. Name of the header, defaults to `Authorization` |

###### Returns

`string` containing the access token; `undefined` if not found.

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

#### oauth2Guard(config)(req, res, next)

ExpressJS middleware mandating the presence of a valid access token and extracting user claims and granted authorities.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| config | object | Required. Configuration (see below) |

`config`:
* `accessTokenSupplier`: Optional. Function extracting the access token from an ExpressJS request, defaults to extraction from `Authorization` header
* `jwtVerifier`: Required. Function verifying the JWT access token
* `onError`: Optional. Function handling errors
* `rolesExtractor`: Optional. Function extracting roles from user claims
* `scopesExtractor`: Optional. Function extracting scopes from access token claims
* `userInfoRetriever`: Required. Function retrieving the user claims from the OIDC provider
* `userInfoScope`: Optional. String controlling whether the retrieval of user info should be attempted. Defaults to `profile`.

##### Example

```javascript
import express from 'express';
import {
  cachedJwtKeySupplier,
  defaultJwtKeySupplier,
  defaultJwtVerifier,
  defaultUserInfoRetriever,
  oauth2Guard,
} from '@quickcase/node-toolkit';

const jwtKeySupplier = cachedJwtKeySupplier()(defaultJwtKeySupplier({jwksUri: 'https://...'}));

const app = express();

app.use(oauth2Guard({
  jwtVerifier: defaultJwtVerifier(jwtKeySupplier),
  userInfoRetriever: defaultUserInfoRetriever({userInfoUri: 'https://...'}),
}));

app.use((req, res, next) => {
  // req.accessToken = 'ey123...';
  // req.grantedAuthorities = ['caseworker', 'caseworker-jid'];
  // req.userClaims = {
  //   sub: '',
  //   ...
  // };
  next();
});
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

##### not(criteria)

Combine criteria with the `NOT` operator.

##### and(...criteria)

Combine multiple criteria with the `AND` operator.

##### or(...criteria)

Combine multiple criteria with the `OR` operator.

##### data(...fields)

Build fully qualified field names to search on.

```js
s.data('level1', 'level2');
// 'data.level1.level2'
```

##### compareToField(field)

Build value as field to facilitate field to field comparison. Can only be used in context of a value in a search dsl 
predicate

```js
s.greaterThan('field1', s.compareToField('field2'));
// greaterThan: {field: field1, value: {field: field2}}
```

##### computedField(field)

Prefix field with identifier for a computed field.

```js
s.computedField('computedField');
// ':computedField'
```

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

##### greaterThan(field, value)

Build a criterion matching on field greater than provided value.
Dynamic field names must be prefixed with `data.`.

##### greaterThanOrEquals(field, value)

Build a criterion matching on field greater than or equals provided value.
Dynamic field names must be prefixed with `data.`.

##### lessThan(field, value)

Build a criterion matching on field less than provided value.
Dynamic field names must be prefixed with `data.`.

##### lessThanOrEquals(field, value)

Build a criterion matching on field less than or equals provided value.
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

#### searchParams(additionalProperties)

Build optional search request parameters

* `additionalProperties` - additional properties to be passed as request parameters

```js
s.searchParams()
    .withLinks()
    .withComputedFields('computedField')
    .build();
```

#### Example

```javascript
import {httpClient, search, searchDsl as s} from '@quickcase/node-toolkit';

// A configured `httpClient` is required by search
const searchClient = httpClient('http://data-store:4452')(() => Promise.resolve('access-token'));

const query = s.query(
  s.and(
    s.contains(s.data('multiSelectField'), 'VALUE_1'),
    s.contains(s.data('collectionField'), s.collectionItem('subfield1', 'value1')),
    s.dateRange(s.data('dateField'), s.fromToDate('2020-01-01', '2020-01-31')),
    s.equals('state', 'STATE_1'),
    s.equalsIgnoreCase(s.data('field1'), 'fooBar'),
    s.equalsAny(s.data('field2'), ['VALUE_1', 'VALUE_2']),
    s.equalsAnyIgnoreCase(s.data('field2'), ['value_1', 'value_2']),
    s.hasValue(s.data('field3'), true),
    s.is(s.data('yesOrNoField'), true), 
    s.greaterThan(s.data('numberField1'), 10), 
    s.greaterThanOrEquals(s.data('numberField2'), s.compareToField('numberField1')),  
    s.lessThan(s.data('numberField3'), 10), 
    s.lessThanOrEquals(s.computedField('numberField4'), 10),
  )
);

const sort = s.sort(
  s.sortAsc('state'),
  s.sortDesc(s.data('field1')),
)

const page = s.page(1, 30);

const params = s.searchParams()
                    .withLinks()
                    .withComputedFields('computedField')
                    .build();

const response = await search(searchClient)('CaseType1')(query)(sort)(page, params);
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

### Test

This library also ships with test helpers available through a separate module `@quickcase/node-toolkit/test` under the `@quickcase/node-toolkit` package.

#### givenMiddleware(middleware).then(req).expect[Response|Next]()

Asynchronous function encapsulating the execution of an Express middleware for test purpose.

##### Arguments

| Name | Type | Description |
|------|------|-------------|
| middleware | function | Required. Express middleware function taking 3 parameters: req, res, next |
| req | object | Required. Request object to be passed to middleware  |

##### Returns

When executed with `.expectResponse()`:
  - returns a `Promise` resolved with the response details if a response was sent with `res.send()` or `res.json()`
  - returns a `Promise` rejected with the value of `next()` if the `next()` callback was called

When executed with `.expectNext()`:
  - returns a `Promise` resolved with the value of `next()` if the `next()` callback was called
  - returns a `Promise` rejected with the response details if a response was sent with `res.send()` or `res.json()`

##### Example

```js
import {givenMiddleware} from '@quickcase/node-toolkit/test';

test('should resolve with response when response expected', async () => {
  const middleware = (req, res) => res.status(201).json({foo: 'bar'});
  const res = await givenMiddleware(middleware).when({}).expectResponse();
  expect(res).toEqual({
    status: 201,
    headers: {},
    body: {foo: 'bar'},
  });
});

test('should resolve with next when next expected', async () => {
  const middleware = (req, res, next) => next('error');
  const next = await givenMiddleware(middleware).when({}).expectNext();
  expect(next).toEqual('error');
});
```

#### stubConfig(config)

Programatically creates a stub of a [lorenwest/node-config](https://github.com/lorenwest/node-config) config instance.
This is useful for instances where a config instance is passed as a parameter to a function and the function needs to be tested with various configurations.

The stub comes with support for the following methods:
- `get(property)`
- `has(property)`

##### Example

```js
import {stubConfig} from '@quickcase/node-toolkit/test';

const impl = (config) => {
  if (!config.has('Customer.dbConfig.host')) {
    throw Error('Config missing');
  }

  const dbHost = config.get('Customer.dbConfig.host');

  // use dbHost...
  return dbHost;
};

test('should error when host not configured', () => {
  const config = stubConfig({
    Customer: {
      dbConfig: {}
    }
  });

  expect(() => impl(config)).toThrow();
});

test('should error when host not configured', () => {
  const config = stubConfig({
    Customer: {
      dbConfig: {
        host: 'hello'
      }
    }
  });

  expect(impl(config)).toEqual('hello');
});
```
