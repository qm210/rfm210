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

  // Initialize our service with any options it requires
  app.use('/glyphset', new Glyphset(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('glyphset');

  service.hooks(hooks);

  service.on('removed', (event) => console.log("Remove", event));

};
