const app = require('../../src/app');

describe('\'glyph\' service', () => {
    it('registered the service', () => {
        const service = app.service('glyph');
        expect(service).toBeTruthy();
    });
});
