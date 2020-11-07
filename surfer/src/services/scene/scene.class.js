const { Service } = require('feathers-nedb');

const initWidth = 640;
const initHeight = 320;

exports.Scene = class Scene extends Service {

    async create(data, params) {
        console.log("CREATE SCENE", data);
        const scenes = await this.find();
        if (!data.order) {
            console.log("SCENES", scenes);
            data.order = scenes.total;
        };
        const existingTitles = Object.values(scenes.data).map(scene => scene.title);
        console.log("existing titles", existingTitles, data.title);
        while (existingTitles.includes(data.title)) {
            data.title += '+';
        }
        data = {
            width: initWidth,
            height: initHeight,
            duration: 10,
            phrases: [],
            sceneQmd: [],
            phraseQmd: [],
            params: {},
            ...data,
        };
        return super.create(data, params);
    }

    async reorderScene(id, shift) {
        const scenes = await this.find();
        console.log("REORDE", id, scenes);
        return this.patch(id);
    }

};
