const { Service } = require('feathers-nedb');

exports.Glyphset = class Glyphset extends Service {

    create(data, params) {
        if (!data.title) {
            return Promise.reject("No Title.");
        }
        return super.create({
            ...data,
            glyphList: [],
        }, params);
    }

    async addGlyph(glyphsetId, glyphId) {
        console.log("ADD TO GLYPHSET");
        const glyphset = await this.get(glyphsetId);
        console.log(glyphset);
        return this.patch(glyphsetId, {
            glyphList: [
                ...glyphset.glyphList,
                glyphId
            ]
        });
    }

};
