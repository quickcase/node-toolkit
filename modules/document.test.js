import {createDocument, getDocument} from './document';

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
          metadata: {
            filename: 'someFile.pdf',
            organisation: 'org1',
            caseType: 'caseType1',
            case: '1234123412341238',
            field: 'field1',
          }
        });
        return Promise.resolve({data: resData});
      },
    };

    const metadata = {
      filename: 'someFile.pdf',
      organisation: 'org1',
      caseType: 'caseType1',
      case: '1234123412341238',
      field: 'field1',
    };
    const docUpload = await createDocument(httpStub)(metadata);
    expect(docUpload).toEqual(resData);
  });
});

describe('getDocument', () => {
  test('should create a new document download URL', async () => {
    const docId = '123-123-123';
    const resData = {
      id: docId,
      download_url: 'http://download-url',
    };
    const httpStub = {
      get: (url) => {
        expect(url).toEqual(`/documents/${docId}`);
        return Promise.resolve({data: resData});
      },
    };

    const docDownload = await getDocument(httpStub)(docId);
    expect(docDownload).toEqual(resData);
  });
});
