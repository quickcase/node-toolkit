import {fetchCaseType} from './definition';

describe('fetchCaseType', () => {
  test('should fetch a case type definition', async () => {
    const caseTypeId = 'caseType1';
    const resData = {
      acls: [],
      case_fields: [],
    };
    const httpStub = {
      get: (url) => {
        expect(url).toEqual(`/api/data/case-type/${caseTypeId}`);
        return Promise.resolve({data: resData});
      },
    };

    const caseType = await fetchCaseType(httpStub)(caseTypeId)();
    expect(caseType).toEqual(resData);
  });
});
