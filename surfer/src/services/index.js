const store = require('./store/store.service.js');
const letter = require('./letter/letter.service.js');
module.exports = function(app) {
    app.configure(store);
    app.configure(letter);
};