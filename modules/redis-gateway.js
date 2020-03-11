import redis from 'redis';

const util = require("util");

const OPEN = 'OPEN';
const BATCHES_OPEN = `batches:open`;
const STATE = 'state';

export const publishBatchMessage = (config) => async (options) => {
  verify(options);
  let client;
  try {
    client = redis.createClient(config);
    const existsAsync = util.promisify(client.exists).bind(client);
    const batchKey = `batch:${options.callerReference}`;

    const isExist = await existsAsync(batchKey);
    if (isExist === 1)
      return Promise.reject(`The batch with id [${options.callerReference}] exists`);

    const multiCommand = client
      .multi()
      .hmset(batchKey, STATE, OPEN)
      .sadd(BATCHES_OPEN, batchKey);

    Object.keys(options).forEach(key => {
      multiCommand
        .hmset(batchKey, key, options[key]);
    });
    const execAsync = util.promisify(multiCommand.exec).bind(multiCommand);
    return await execAsync();
  } catch (err) {
    return Promise.reject(err);
  } finally {
    client.quit();
  }
};

const verify = (options) => {
  if (!options) {
    throw new Error('Options is mandatory.');
  } else if (!options.callerReference) {
    throw new Error('Caller Reference is mandatory.');
  } else if (!options.jobs) {
    throw new Error('Jobs is mandatory.');
  } else if (!options.notifyUrl) {
    throw new Error('Notify Url is mandatory.');
  }
};
