const app = require('../../src/app');

describe('\'scene\' service', () => {
  it('registered the service', () => {
    const service = app.service('scene');
    expect(service).toBeTruthy();
  });
});
