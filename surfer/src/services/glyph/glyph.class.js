const { Service } = require('feathers-nedb');

exports.Glyph = class Glyph extends Service {

    setup(app) {
        this.glyphsetService = app.service('glyphset');
    }

    async create(data, params) {
        if (data.cloneId) {
            const clone = await this.get(data.cloneId);
            data = {...data, ...clone};
        }
        delete data.cloneId;
        return super.create(data, params);
    }

    get(data, params) {
        console.log("GEEET", data, params);
        return super.get(data, params);
    }

};
