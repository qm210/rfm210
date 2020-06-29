// Initializes the `store` service on path `/store`
const { Store } = require('./store.class');
const createModel = require('../../models/store.model');
const hooks = require('./store.hooks');

module.exports = function (app) {
    const options = {
        Model: createModel(app),
        paginate: app.get('paginate')
    };

    // Initialize our service with any options it requires
    app.use('/store', new Store(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('store');

    service.hooks(hooks);
};
