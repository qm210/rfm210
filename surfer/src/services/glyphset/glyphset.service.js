// Initializes the `glyphset` service on path `/glyphset`
const { Glyphset } = require('./glyphset.class');
const createModel = require('../../models/glyphset.model');
const hooks = require('./glyphset.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: ['remove'],
  };

  app.use('/glyphset', new Glyphset(options, app));

  const service = app.service('glyphset');
  service.hooks(hooks);

  service.on('removed', glyphset => console.log("Remove", glyphset));
};
