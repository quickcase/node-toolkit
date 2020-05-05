import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';
import {useCache} from '../cache';

/**
 * @callback JwtKeySupplier
 * @param {object} jwtHeader
 * @return {Promise} Promise resolved with JWT key when key cannot be retrieved
 */

 /**
  * A decorator for JwtKeySupplier adding caching per `kid`.
  * @param {object} config Configuration for caching mechanism
  * @param {JwtKeySupplier} jwtKeySupplier Decorated instance of JwtKeySupplier
  * @return {JwtKeySupplier} A JWT key supplier with caching
  */
 export const cachedJwtKeySupplier = (config) => (jwtKeySupplier) => {
   const [get, set] = useCache(config);
   return async (jwtHeader) => get(jwtHeader.kid) || set(jwtHeader.kid)(await jwtKeySupplier(jwtHeader));
 };

/**
 * A default implementation of a JwtKeySupplier using library `jwks-rsa`.
 *
 * @param {object} config Configuration for this JWT key supplier
 * @return {JwtKeySupplier} A JWT key supplier ready for use
 */
export const defaultJwtKeySupplier = ({jwksUri}) => {
  const client = jwksClient({jwksUri});
  return (jwtHeader) => new Promise((resolve, reject) => client.getSigningKey(jwtHeader.kid, (err, key) => err ? reject(err) : resolve(key.publicKey || key.rsaPublicKey)));
};

/**
 * @callback JwtVerifier
 * @param {string} jwtToken Function providing the key to verify the JWT token
 * @return {Promise} Promise resolved with JWT payload of key-value pairs when JWT token is verified; rejected otherwise with error
 */

/**
 * A default implementation of a JwtVerifier relying on a JwtKeySupplier and using library `jsonwebtoken`.
 *
 * @param {JwtKeySupplier} jwtKeySupplier Function providing the key to verify the JWT token
 * @return {JwtVerifier} A JWT verifier ready for use
 */
export const defaultJwtVerifier = (jwtKeySupplier) => (jwtToken) => new Promise((resolve, reject) => jwt.verify(jwtToken, jwtKeySupplierAdapter(jwtKeySupplier), (err, claims) => err ? reject(err) : resolve(claims)));
const callbackFromPromise = (callback) => (promise) => promise.then((data) => callback(null, data)).catch((err) => callback(err, null));
const jwtKeySupplierAdapter = (jwtKeySupplier) => (jwtHeader, callback) => callbackFromPromise(callback)(jwtKeySupplier(jwtHeader));
