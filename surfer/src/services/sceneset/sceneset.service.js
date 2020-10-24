// Initializes the `sceneset` service on path `/sceneset`
const { Sceneset } = require('./sceneset.class');
const createModel = require('../../models/sceneset.model');
const hooks = require('./sceneset.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/sceneset', new Sceneset(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('sceneset');

  service.hooks(hooks);
};
