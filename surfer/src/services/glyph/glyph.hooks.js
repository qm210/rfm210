

module.exports = {
    before: {
        all: [],
        find: [],
        get: [],
        create: [
            context => {
                console.log(context);
            }
        ],
        update: [],
        patch: [],
        remove: []
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    },

    error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    }
};
