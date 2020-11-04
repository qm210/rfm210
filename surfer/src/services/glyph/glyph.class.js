const { Service } = require('feathers-nedb');

const new2D = (width, height, value = false) => Array(height).fill(Array(width).fill(value));

exports.Glyph = class Glyph extends Service {

    setup(app) {
        this.initWidth = 9;
        this.initHeight = 16;
    }

    async create(data, params) {
        console.log("call create", data);
        if (data.cloneId) {
            const clone = await this.get(data.cloneId);
            data = {...data, ...clone};
        } else {
            data = {
                ...data,
                pixels: new2D(data.width || this.initWidth, data.height || this.initHeight),
            };
        }
        delete data.cloneId;
        console.log("CREATE GLYPH", data);
        return super.create(data, params);
    }

};
