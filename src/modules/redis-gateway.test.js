import redis from 'redis';
import {publishBatchMessage} from "./redis-gateway";

const util = require("util");

describe('publishBatchMessage', () => {

  const BATCH_MESSAGE = {jobs: {}, callerReference: 'case-ref', notifyUrl: {}};
  const PUBLISH_RESPONSE = ['OK'];
  let IS_BATCH_EXIST = 0;
  const redisClient = {
    'multi': () => redisClient,
    'sadd': () => redisClient,
    'hmset': () => redisClient,
    'hget': () => redisClient,
    'quit': () => redisClient,
  };

  let executionPromise = () => Promise.resolve(PUBLISH_RESPONSE);

  beforeEach(() => {
    IS_BATCH_EXIST = 0;
    let bindExecutionCount = 0;
    util.promisify = jest.fn()
      .mockReturnValue({
        bind: jest.fn(() => {
          if (bindExecutionCount === 0) {
            bindExecutionCount++;
            return () => Promise.resolve(IS_BATCH_EXIST);
          } else {
            return executionPromise;
          }
        }),
      });

    redis.createClient = jest
      .fn()
      .mockReturnValue(redisClient);
  });

  test('should return success message when published', (done) => {
    redisClient.quit = () => done();

    publishBatchMessage({})(BATCH_MESSAGE).then(
      result => {
        expect(result).toEqual(PUBLISH_RESPONSE);
      }
    );
  });

  test('should throw error when batch already exists', (done) => {
    IS_BATCH_EXIST = 1;
    const callerReference = 'case-ref';
    publishBatchMessage({})(BATCH_MESSAGE)
      .catch(err => {
        expect(err).toEqual(`The batch with id [${callerReference}] exists`);
        done();
      });
  });


  test('should throw error when execution fails', (done) => {
    const errorMessage = 'Error occurred on execution.';
    executionPromise = () => Promise.reject(errorMessage);
    redisClient.quit = () => done();
    publishBatchMessage({})(BATCH_MESSAGE)
      .catch(err => {
        expect(err).toEqual(errorMessage);
      })
  });

  describe('Mandatory fields check', () => {
    test('should check options object', (done) => {

      publishBatchMessage({})()
        .catch(err => {
          expect(err.message).toEqual('Options is mandatory.');
          done();
        });
    });
    test('should check caller reference', (done) => {
      publishBatchMessage({})({jobs: {}, notifyUrl: ''})
        .catch(err => {
          expect(err.message).toEqual('Caller Reference is mandatory.');
          done();
        });
    });
    test('should check jobs', (done) => {
      publishBatchMessage({})({callerReference: {}, notifyUrl: ''})
        .catch(err => {
          expect(err.message).toEqual('Jobs is mandatory.');
          done();
        });

    });
    test('should check notify url', (done) => {
      publishBatchMessage({})({callerReference: {}, jobs: {}})
        .catch(err => {
          expect(err.message).toEqual('Notify Url is mandatory.');
          done();
        });
    });
  });

});
