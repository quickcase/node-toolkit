import {createDocument} from './document';

describe('createDocument', () => {
  test('should create a new document upload URL', async () => {
    const resData = {
      id: '123-123-123',
      upload_url: 'http://upload-url',
    };
    const httpStub = {
      post: (url, body) => {
        expect(url).toEqual('/documents');
        expect(body).toEqual({
          organisation: 'org1',
          caseType: 'caseType1',
          field: 'field1',
        });
        return Promise.resolve({data: resData});
      },
    };

    const metadata = {
      organisation: 'org1',
      caseType: 'caseType1',
      field: 'field1',
    };
    const docUpload = await createDocument(httpStub)(metadata);
    expect(docUpload).toEqual(resData);
  });
});
