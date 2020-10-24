const app = require('../../src/app');

describe('\'sceneset\' service', () => {
  it('registered the service', () => {
    const service = app.service('sceneset');
    expect(service).toBeTruthy();
  });
});
