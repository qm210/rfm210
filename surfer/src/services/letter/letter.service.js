// Initializes the `letter` service on path `/letter`
const { Letter } = require('./letter.class');
const createModel = require('../../models/letter.model');
const hooks = require('./letter.hooks');

module.exports = function (app) {
    const options = {
        Model: createModel(app),
        paginate: app.get('paginate')
    };

    // Initialize our service with any options it requires
    app.use('/letter', new Letter(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('letter');

    service.hooks(hooks);
};
