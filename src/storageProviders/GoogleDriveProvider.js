export default class GoogleDriveProvider {
  // Client ID and API key from the Developer Console
  get clientId() {
    return '228271316918-k2sarmhfjfi842477oqnnbofunmv7tef.apps.googleusercontent.com';
  }
  get apiKey() {
    return 'AIzaSyClUHnIHhxGPGKBQaQ9PLuzSDwbGmQ-5MM';
  }

  // Array of API discovery doc URLs for APIs used by the quickstart
  get discoveryDocs() {
    return ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
  }

  // Authorization scopes required by the API; multiple scopes can be included, separated by spaces
  get scopes() {
    return 'https://www.googleapis.com/auth/drive';
  }

  get scriptSrc() {
    return 'https://apis.google.com/js/client.js';
  }

  get fileExtension() {
    return 'hmd';
  }

  get type() {
    return 'GoogleDrive';
  }

  constructor() {
    let scriptElement = document.querySelector('#googleDrive');
    if (!scriptElement) {
      let script = document.createElement("script");
      script.src = 'https://apis.google.com/js/client.js';

      script.onload = () => {
        window.gapi.load('client:auth2', this.initClient.bind(this));
      };

      document.body.appendChild(script);
    } else {
      throw 'Google Drive provider already created';
    }
  }

  // Initializes the API client library and sets up sign-in state listeners.
  initClient() {
    window.gapi.client.init({
      apiKey: this.apiKey,
      clientId: this.clientId,
      discoveryDocs: this.discoveryDocs,
      scope: this.scopes
    }).then(() => {
      window.gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus.bind(this));

      // Handle the initial sign-in state.
      this.updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
    });
  }

  updateSigninStatus(isSignedIn) {
    this.isSignedIn = isSignedIn;
  }

  authenticate() {
    return window.gapi.auth2.getAuthInstance().signIn();
  }

  signout() {
    //window.gapi.auth2.getAuthInstance().disconnect();
    return window.gapi.auth2.getAuthInstance().signOut();
  }

  listFiles(folderId = 'root', pageSize = 1000) {
    return window.gapi.client.drive.files.list({
      'pageSize': pageSize,
      'fields': 'nextPageToken, files(id, name, fileExtension, mimeType)',
      'spaces': 'drive',
      'q': 'trashed = false and "' + folderId + '" in parents and (name contains ".' + this.fileExtension + '" or mimeType = "application/vnd.google-apps.folder")',
    });
  }

  downloadFile(fileId) {
    return window.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });
  }

  async uploadFile(name, data, parentId = 'root') {
    let fileId;
    await window.gapi.client.drive.files.create({
      resource: {
        'name': name,
        'mimeType': 'application/octet-stream',
        'parents': [parentId]
      },
      fields: 'id'
    }).then((response) => {
      switch (response.status) {
        case 200:
          fileId = response.result.id;
          break;
        default:
          throw 'Error creating the file, ' + response;
      }
    });

    return this.updateFile(data, fileId);
  }

  updateFile(data, fileId) {
    return window.gapi.client.request({
      path: '/upload/drive/v3/files/' + fileId,
      method: 'PATCH',
      params: {
        uploadType: 'media'
      },
      body: data
    });
  }
}