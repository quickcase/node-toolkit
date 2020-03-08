import redis from 'redis';

const util = require("util");

const OPEN = 'OPEN';
const BATCHES_OPEN = `batches:open`;
const STATE = 'state';

export const publishBatchMessage = (config) => (options) => {
  if (!options || !options.callerReference || !options.jobs || !options.callbackEvent)
    throw new Error('Mandatory fields missing.');
  const client = redis.createClient(config);
  const existsAsync = util.promisify(client.exists).bind(client);

  const batchKey = `batch:${options.callerReference}`;

  return existsAsync(batchKey)
    .then(result => {
      if (result === 1)
        return Promise.reject(`The batch with id [${options.callerReference}] exists`);

      const multiCommand = client
        .multi();

      Object.keys(options).forEach(key => {
        multiCommand
          .hmset(batchKey, key, options[key]);
      });

      const execAsync = util.promisify(multiCommand.exec).bind(multiCommand);

      multiCommand
        .hmset(batchKey, STATE, OPEN)
        .sadd(BATCHES_OPEN, batchKey);

      return execAsync()
        .then(replies => {
          client.quit();
          return replies;
        });
    }).catch(err => {
      client.quit();
      throw err;
    });
};
