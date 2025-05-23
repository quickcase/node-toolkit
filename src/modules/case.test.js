import {
  createCase,
  fetchCase,
  fieldExtractor,
  idFrom36,
  idTo36,
  isCaseIdentifier,
  isCaseIdentifier36,
  updateCase,
} from './case';

describe('fetchCase', () => {
  test('should fetch case by id', async () => {
    const caseId = '1234123412341238';
    const resData = {
      id: caseId,
      data: {},
    };
    const httpStub = {
      get: (url) => {
        expect(url).toEqual(`/cases/${caseId}`);
        return Promise.resolve({data: resData});
      },
    };

    const actualData = await fetchCase(httpStub)(caseId)();
    expect(actualData).toEqual(resData);
  });

  test('should fetch case by id with request parameters', async () => {
    const caseId = '1234123412341238';
    const resData = {
      id: caseId,
      data: {},
    };
    const httpStub = {
      get: (url, params) => {
        expect(url).toEqual(`/cases/${caseId}`);
        expect(params).toEqual({field: 'field1'});
        return Promise.resolve({data: resData});
      },
    };

    const actualData = await fetchCase(httpStub)(caseId, {field: 'field1'})();
    expect(actualData).toEqual(resData);
  });
});

describe('fieldExtractor', () => {
  test('should extract field from case `data`', () => {
    const aCase = {
      data: {
        level1: {
          level2: 'value'
        }
      }
    };

    const fieldValue = fieldExtractor(aCase)('level1.level2');
    expect(fieldValue).toEqual('value');
  });

  test('should extract field from case `case_data`', () => {
    const aCase = {
      data: {
        level1: {
          level2: 'value'
        }
      }
    };

    const fieldValue = fieldExtractor(aCase)('level1.level2');
    expect(fieldValue).toEqual('value');
  });

  test('should extract field as undefined when path does not exist', () => {
    const aCase = {
      data: {
        level1: {
          level2: 'value'
        }
      }
    };

    const fieldValue = fieldExtractor(aCase)('nolevel.level2');
    expect(fieldValue).toBeUndefined();
  });

  test('should extract field as undefined when parent element is null', () => {
    const aCase = {
      data: {
        level1: null
      }
    };

    const fieldValue = fieldExtractor(aCase)('level1.level2');
    expect(fieldValue).toBeUndefined();
  });

  test('should extract field as undefined when case has no data', () => {
    const aCase = {};

    const fieldValue = fieldExtractor(aCase)('level1.level2');
    expect(fieldValue).toBeUndefined();
  });

  test('should extract array of fields from case data', () => {
    const aCase = {
      data: {
        level1: {level2: 'value1'},
        field2: 'value2',
      },
    };

    const values = fieldExtractor(aCase)([
      'level1.level2',
      'notFound1',
      'field2',
      'notFound2',
    ]);
    expect(values).toEqual(['value1', undefined, 'value2', undefined]);
  });

  test('should extract object of fields from case data', () => {
    const aCase = {
      data: {
        level1: {level2: 'value1'},
        field2: 'value2',
      },
    };

    const values = fieldExtractor(aCase)({
      value1: 'level1.level2',
      notFound1: 'notFound1',
      value2: 'field2',
      notFound2: 'notFound2',
    });
    expect(values).toEqual({
      value1: 'value1',
      notFound1: undefined,
      value2: 'value2',
      notFound2: undefined,
    });
  });

  test('should extract simple collection item from case `data` using item index', () => {
    const aCase = {
      data: {
        level1: {
          level2: [
            {id: '123', value: 'value1'},
            {id: '456', value: 'value2'},
            {id: '789', value: 'value3'},
          ],
        }
      }
    };

    const fieldValues = fieldExtractor(aCase)([
      'level1.level2[2].value',
      'level1.level2[1].value',
      'level1.level2[0].value',
    ]);
    expect(fieldValues).toEqual([
      'value3',
      'value2',
      'value1',
    ]);
  });

  test('should extract complex collection item from case `data` using item index', () => {
    const aCase = {
      data: {
        level1: {
          level2: [
            {id: '123', value: {key: 'value1'}},
            {id: '456', value: {key: 'value2'}},
          ],
        }
      }
    };

    const fieldValues = fieldExtractor(aCase)('level1.level2[1].value.key');
    expect(fieldValues).toEqual('value2');
  });

  test('should extract collection item as undefined when out of range', () => {
    const aCase = {
      data: {
        level1: {
          level2: [
            {id: '123', value: 'value1'},
          ],
        }
      }
    };

    const fieldValues = fieldExtractor(aCase)('level1.level2[1].value');
    expect(fieldValues).toBeUndefined();
  });

  test('should extract collection item as undefined when invalid index', () => {
    const aCase = {
      data: {
        level1: {
          level2: [
            {id: '123', value: 'value1'},
          ],
        }
      }
    };

    const fieldValues = fieldExtractor(aCase)('level1.level2[a].value');
    expect(fieldValues).toBeUndefined();
  });

  test('should extract collection item as undefined when not collection', () => {
    const aCase = {
      data: {
        level1: {
          level2: 'hello',
        }
      }
    };

    const fieldValues = fieldExtractor(aCase)('level1.level2[0].value');
    expect(fieldValues).toBeUndefined();
  });

  test('should extract collection item as undefined when item malformed', () => {
    const aCase = {
      data: {
        level1: {
          level2: [true],
        }
      }
    };

    const fieldValues = fieldExtractor(aCase)('level1.level2[0].value');
    expect(fieldValues).toBeUndefined();
  });

  test('should extract collection item as undefined when null', () => {
    const aCase = {
      data: {
        level1: {
          level2: [null],
        }
      }
    };

    const fieldValues = fieldExtractor(aCase)('level1.level2[0].value');
    expect(fieldValues).toBeUndefined();
  });

  test('should extract simple collection item from case `data` using item ID', () => {
    const aCase = {
      data: {
        level1: {
          level2: [
            {id: '123', value: 'value1'},
            {id: '456', value: 'value2'},
            {id: '789', value: 'value3'},
          ],
        }
      }
    };

    const fieldValues = fieldExtractor(aCase)([
      'level1.level2[id:456].value',
      'level1.level2[id:789].value',
      'level1.level2[id:123].value',
    ]);
    expect(fieldValues).toEqual([
      'value2',
      'value3',
      'value1',
    ]);
  });

  test('should extract complex collection item from case `data` using item ID', () => {
    const aCase = {
      data: {
        level1: {
          level2: [
            {id: '123', value: {key: 'value1'}},
          ],
        }
      }
    };

    const fieldValues = fieldExtractor(aCase)('level1.level2[id:123].value.key');
    expect(fieldValues).toEqual('value1');
  });

  test('should extract collection item as undefined when invalid ID', () => {
    const aCase = {
      data: {
        level1: {
          level2: [
            {id: '123', value: 'value1'},
          ],
        }
      }
    };

    const fieldValues = fieldExtractor(aCase)('level1.level2[id:456].value');
    expect(fieldValues).toBeUndefined();
  });

  test('should throw error if provided path is not of a supported type', () => {
    const aCase = {};

    expect(() => fieldExtractor(aCase)(123)).toThrow('Unsupported path \'123\' of type number');
  });

  test('should throw error if provided path is null', () => {
    const aCase = {};

    expect(() => fieldExtractor(aCase)(null)).toThrow('Unsupported path \'null\' of type object');
  });
});

describe('isCaseIdentifier', () => {
  test('should be false when length is less than 16 characters', () => {
    expect(isCaseIdentifier('1234')).toBe(false);
  });

  test('should be false when length is more than 16 characters', () => {
    expect(isCaseIdentifier('12345678901234567890')).toBe(false);
  });

  test('should be false when contains characters others than digits', () => {
    expect(isCaseIdentifier('123412341234123A')).toBe(false);
  });

  test('should be false when check digit does not match', () => {
    expect(isCaseIdentifier('1234123412341234')).toBe(false);
  });

  test.each([
    '1234123412341238',
    '1579871203156511',
    '1579873635774838',
    1579873635774838,
  ])('should be true when 16-digit number with correct check digit: %s', (identifier) => {
    expect(isCaseIdentifier(identifier)).toBe(true);
  });
});

describe('idTo36', () => {
  test('should encode case identifier to base36', () => {
    expect(idTo36('1583178988495195')).toBe('0fl6udxa2qj');
  });

  test('should encode number to base36 with 0-padding', () => {
    expect(idTo36('1234567890')).toBe('00000kf12oi');
  });
});

describe('idFrom36', () => {
  test('should decode case identifier from base36', () => {
    expect(idFrom36('0fl6udxa2qj')).toBe('1583178988495195');
  });

  test('should decode number from base36 with 0-padding', () => {
    expect(idFrom36('00000kf12oi')).toBe('1234567890');
  });
});

describe('isCaseIdentifier36', () => {
  test('should return true when the string is a base 36 representation of case identifier', () => {
    expect(isCaseIdentifier36('0fl6udxa2qj')).toBe(true);
  });

  test('should return false when the string is not a base 36 representation of case identifier', () => {
    expect(isCaseIdentifier36('00000kf12oi')).toBe(false);
  });
});

describe('createCase', () => {
  test('should create a case for given case type and event', async () => {
    const caseTypeId = 'aCaseType';
    const eventId = 'anEvent';
    const token = 'trigger-token';
    const payload = {
      data: {field1: 'value1'},
      summary: 'A summary',
      description: 'A description',
    };
    const caseId = '1234123412341238';
    const httpStub = {
      get: (url) => {
        expect(url).toEqual(`/case-types/${caseTypeId}/event-triggers/${eventId}`);
        return Promise.resolve({data: {token, case_details: {case_data: {field1: 'value0', field2: 'value2'}}}});
      },
      post: (url, body) => {
        expect(url).toEqual(`/case-types/${caseTypeId}/cases`);
        expect(body).toEqual({
          data: {
            field1: 'value1',
            field2: 'value2',
          },
          event: {
            id: eventId,
            summary: payload.summary,
            description: payload.description,
          },
          event_token: token,
        });
        return Promise.resolve({data: {
          id: caseId,
          data: body.data,
        }});
      },
    };

    const createdCase = await createCase(httpStub)(caseTypeId)(eventId)(payload);
    expect(createdCase).toEqual({
      id: caseId,
      data: {
        field1: 'value1',
        field2: 'value2',
      },
    });
  });

  test('should create a case for given case type and event without payload', async () => {
    const caseTypeId = 'aCaseType';
    const eventId = 'anEvent';
    const token = 'trigger-token';
    const caseId = '1234123412341238';
    const httpStub = {
      get: (url) => {
        expect(url).toEqual(`/case-types/${caseTypeId}/event-triggers/${eventId}`);
        return Promise.resolve({data: {token, case_details: {case_data: {}}}});
      },
      post: (url, body) => {
        expect(url).toEqual(`/case-types/${caseTypeId}/cases`);
        expect(body).toEqual({
          data: {},
          event: {
            id: eventId,
            summary: undefined,
            description: undefined,
          },
          event_token: token,
        });
        return Promise.resolve({data: {
          id: caseId,
          data: {},
        }});
      },
    };

    const createdCase = await createCase(httpStub)(caseTypeId)(eventId)();
    expect(createdCase).toEqual({
      id: caseId,
      data: {},
    });
  });
});

describe('updateCase', () => {
  test('should update a case for given case ID and event', async () => {
    const caseId = '1234123412341238';
    const eventId = 'anEvent';
    const token = 'trigger-token';
    const payload = {
      data: {field1: 'value1'},
      summary: 'A summary',
      description: 'A description',
    };
    const httpStub = {
      get: (url) => {
        expect(url).toEqual(`/cases/${caseId}/event-triggers/${eventId}`);
        return Promise.resolve({data: {token, case_details: {case_data: {field1: 'value0', field2: 'value2'}}}});
      },
      post: (url, body) => {
        expect(url).toEqual(`/cases/${caseId}/events`);
        expect(body).toEqual({
          data: {
            field1: 'value1',
            field2: 'value2',
          },
          event: {
            id: eventId,
            summary: payload.summary,
            description: payload.description,
          },
          event_token: token,
        });
        return Promise.resolve({data: {
          id: caseId,
          data: body.data,
        }});
      },
    };

    const updatedCase = await updateCase(httpStub)(caseId)(eventId)(payload);
    expect(updatedCase).toEqual({
      id: caseId,
      data: {
        field1: 'value1',
        field2: 'value2',
      },
    });
  });

  test('should update a case for given case ID and event without payload', async () => {
    const caseId = '1234123412341238';
    const eventId = 'anEvent';
    const token = 'trigger-token';
    const httpStub = {
      get: (url) => {
        expect(url).toEqual(`/cases/${caseId}/event-triggers/${eventId}`);
        return Promise.resolve({data: {token, case_details: {case_data: {}}}});
      },
      post: (url, body) => {
        expect(url).toEqual(`/cases/${caseId}/events`);
        expect(body).toEqual({
          data: {},
          event: {
            id: eventId,
            summary: undefined,
            description: undefined,
          },
          event_token: token,
        });
        return Promise.resolve({data: {
          id: caseId,
          data: {
            field1: 'value1',
          },
        }});
      },
    };

    const updatedCase = await updateCase(httpStub)(caseId)(eventId)();
    expect(updatedCase).toEqual({
      id: caseId,
      data: {
        field1: 'value1',
      },
    });
  });
});
