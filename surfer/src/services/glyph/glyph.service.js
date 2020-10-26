const { Glyph } = require('./glyph.class');
const createModel = require('../../models/glyph.model');
const hooks = require('./glyph.hooks');

module.exports = function (app) {
    const options = {
        Model: createModel(app),
        paginate: app.get('paginate'),
        multi: true,
    };

    app.use('/glyph', new Glyph(options, app));

    const service = app.service('glyph');
    service.hooks(hooks);

    const glyphsetService = app.service('glyphset');

    service.on('created', async glyph => {
        await glyphsetService.addGlyph(glyph.glyphsetId, glyph._id);
        console.log("Created", glyph);
    });
    service.on('removed', glyph => console.log("Removed", glyph));
};
