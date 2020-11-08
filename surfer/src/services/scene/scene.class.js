const { Service } = require('feathers-nedb');

exports.Scene = class Scene extends Service {

    async find(params) {
        const all = await super.find(params);
        return all.map(
            ({_id, title, order}) => ({_id, title, order})
        );
    }

    async create(data, params) {
        console.log("CREATE SCENE", data);
        const scenes = await this.find();
        console.log("what?", !data.order);
        if (!data.order) {
            data.order = this.maxOrder(scenes) + 1;
        } else {
            await this.preorderScenes(scenes, data.order);
        }
        console.log("well!", data.order);
        const existingTitles = Object.values(scenes).map(scene => scene.title);
        console.log("existing titles", existingTitles, data.title);
        while (existingTitles.includes(data.title)) {
            const nextNumber = parseInt(data.title.slice(-1)) + 1 || 2;
            data.title = data.title.slice(0, -1) + nextNumber;
        }
        data = {
            duration: 10,
            figures: [],
            sceneQmd: [],
            phraseQmd: [],
            params: {},
            ...data,
        };
        return super.create(data, params);
    }

    async remove(id, params) {
        const oldScene = await super.remove(id, params);
        const previousScene = this.consolidateOrder(oldScene.order - 1);
        return previousScene;
    }

    async scenesInOrder(params) {
        const scenes = await this.find(params);
        return scenes.sort((a,b) => a.order - b.order);
    }

    async consolidateOrder(returnSceneOrder) {
        const scenes = await this.scenesInOrder();
        console.log("CONSOLIDATE", scenes);
        await Promise.all(
            scenes.map((scene, index) =>
                this.patch(scene._id, {
                    order: index
                })
            )
        );
        if (returnSceneOrder) {
            return scenes.find(scene => scene.order === returnSceneOrder);
        }
    }

    async preorderScenes(scenes, orderToBe) {
        const scenesToShift = scenes.filter(scene => scene.order > orderToBe);
        await Promise.all(
            scenesToShift.map(scene =>
                this.patch(scene._id, {
                    order: scene.order + 1
                })
            )
        );
    }

    async reorderScene(id, delta) {
        const scenes = this.scenesInOrder();
        const thisScene = scenes.find(it => it._id == id);
        const newOrder = thisScene.order + delta;
        const otherScene = scenes.find(it => it.order === newOrder);
        if (!otherScene) {
            return thisScene;
        }
        await this.patch(otherScene._id, {order: thisScene.order});
        return await this.patch(thisScene._id, {order: newOrder});
    }

    maxOrder(scenes) {
        return scenes.reduce((a,b) => Math.max(a.order, b.order), -1);
    }

};
