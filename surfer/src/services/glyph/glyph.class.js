const { Service } = require('feathers-nedb');

const new2D = (width, height, value = false) => Array(height).fill(Array(width).fill(value));
const width2D = (array2D) => array2D ? array2D[0] ? array2D[0].length : 0 : 0;
const height2D = (array2D) => array2D ? array2D.length : 0;

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
        this.sanitize(data);
        console.log("CREATE GLYPH", data);
        return super.create(data, params);
    }

    async patch(id, data, params) {
        this.sanitize(data);
        console.log("PATCH GLYPH", data);
        return super.patch(id, data, params);
    }

    sanitize(data) {
        if (!data.width) {
            data.width = width2D(data.pixels);
        }
        if (!data.height) {
            data.height = height2D(data.pixels);
        }
    }
};
