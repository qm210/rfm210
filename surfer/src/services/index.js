const store = require('./store/store.service.js');
const glyph = require('./glyph/glyph.service.js');
const glyphset = require('./glyphset/glyphset.service.js');
const sceneset = require('./sceneset/sceneset.service.js');
module.exports = function(app) {
    app.configure(store);
    app.configure(glyphset);
    app.configure(glyph);
    app.configure(sceneset);
};