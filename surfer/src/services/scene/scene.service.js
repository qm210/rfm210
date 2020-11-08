// Initializes the `scene` service on path `/scene`
const { Scene } = require('./scene.class');
const createModel = require('../../models/scene.model');
const hooks = require('./scene.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    multi: ['remove']
  };

  // Initialize our service with any options it requires
  app.use('/scene', new Scene(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('scene');

  service.hooks(hooks);
};
