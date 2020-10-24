const app = require('../../src/app');

describe('\'glyphset\' service', () => {
  it('registered the service', () => {
    const service = app.service('glyphset');
    expect(service).toBeTruthy();
  });
});
