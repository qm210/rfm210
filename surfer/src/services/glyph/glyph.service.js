// Initializes the `glyph` service on path `/glyph`
const { Glyph } = require('./glyph.class');
const createModel = require('../../models/glyph.model');
const hooks = require('./glyph.hooks');

module.exports = function (app) {
    const options = {
        Model: createModel(app),
        paginate: app.get('paginate')
    };

    // Initialize our service with any options it requires
    app.use('/glyph', new Glyph(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('glyph');

    service.hooks(hooks);

    service.on('created', (event) => console.log("Created", event));
};
