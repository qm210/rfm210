const store = require('./store/store.service.js');
const letter = require('./letter/letter.service.js');
const glyphset = require('./glyphset/glyphset.service.js');
const sceneset = require('./sceneset/sceneset.service.js');
module.exports = function(app) {
    app.configure(store);
    app.configure(letter);
    app.configure(glyphset);
    app.configure(sceneset);
};