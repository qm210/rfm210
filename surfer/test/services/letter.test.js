const app = require('../../src/app');

describe('\'letter\' service', () => {
    it('registered the service', () => {
        const service = app.service('letter');
        expect(service).toBeTruthy();
    });
});
