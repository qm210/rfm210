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

    service.on('created', glyph => {
        console.log("glyph created");
        glyphsetService.addGlyph(glyph.glyphsetId, glyph._id);
    });
    service.on('removed', glyph  => {
        glyphsetService.deleteGlyph(glyph.glyphsetId, glyph._id);
    });
};
