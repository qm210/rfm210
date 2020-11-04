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
        const glyphset = await this.get(glyphsetId);
        return this.patch(glyphsetId, {
            glyphList: [
                ...glyphset.glyphList,
                glyphId
            ]
        });
    }

    async deleteGlyph(glyphsetId, glyphId) {
        const glyphset = await this.get(glyphsetId);
        return this.patch(glyphsetId, {
            glyphList: glyphset.glyphList.filter(id => id !== glyphId)
        });
    }
};
