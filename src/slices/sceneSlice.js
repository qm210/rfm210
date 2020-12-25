import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { surfer } from '..';
import { STATUS } from '../const';

export const PHRASE = "PHRASE"

const service = () => surfer.service('scene');

const initFigure = {
    type: null,
    x: 0,
    y: 0,
    phi: 0,
    active: true,
    scale: .5,
    scaleX: 1,
    scaleY: 1,
    spacing: 0,
    color: {
        r: 0,
        g: 0,
        b: 0,
        a: 1,
    },
    startTime: 0,
    endTime: 0,
    shaderFunc: "",
    qmd: [],
    placeholder: true,
};

export const selectCurrentFigure = store =>
    store.scene.current && store.scene.current.figures[store.scene.current.currentFigureId];

const toList = obj => Object.values(obj || {});

export const selectFigureList = store => toList(store.scene.current && store.scene.current.figures);
export const selectSceneList = store => toList(store.scene.all).sort((a,b) => a.order - b.order);

export const fetchScenes = createAsyncThunk('scene/fetchAll', async () => ({
    all: await service().find({reduced: true})
}));

export const fetchScene = createAsyncThunk('scene/fetch', async (id, {getState, dispatch}) => {
    const newCurrent = await service().get(id);
    if (newCurrent) {
        return {current: newCurrent};
    }
    console.log("NOT FOUND", newCurrent);
    await dispatch(fetchScenes());
    const foundCurrent = getState().scene.all.find(scene => scene._id);
    console.log("now stuff is...", foundCurrent);
    return {current: foundCurrent};
});

export const addNewScene = createAsyncThunk('scene/add', async (data, {getState}) => {
    const current = getState().scene.current;
    console.log("ORDER??", current ? current.order + 1 : null);
    const newScene = await service().create({
        order: current ? current.order + 1 : null,
        ...data
    });
    const allScenes = await service().find();
    console.log("HEHE", newScene, allScenes)
    return {current: newScene, all: allScenes};
});

export const reorderScene = createAsyncThunk('scene/reorder', async (delta, {getState}) => {
    const current = getState().scene.current;
    if (!current) {
        return {};
    }
    console.log("CID", current._id, delta);
    const newCurrent = await service().patch(current._id, {swapOrder: delta});
    const all = await service().find();
    return {current: newCurrent, all};
});

export const deleteScene = createAsyncThunk('scene/delete', async (id, {dispatch, getState}) => {
    const previousScene = await service().remove(id);
    // question: need to await?
    dispatch(fetchScenes());
    return {current: previousScene};
}, {condition: id => !!id});

export const deleteAllScenes = createAsyncThunk('scenes/clear', async () =>
    await service().remove(null)
);

export const patchScene = createAsyncThunk('scene/update', async (_, {getState}) => {
    const scene = getState().scene.current;
    return await service().patch(scene._id, scene);
});

/*
// won't work this way. just update whole scene for now, this is just local traffic...
export const patchFigure = createAsyncThunk('scene/updateFigure', async (_, {getState}) => {
    const scene = getState().scene.current;
    const figure = selectCurrentFigure(getState());
    console.log("PATCH FIG.", scene, figure);
    return await service().patch(scene._id, {figure});
});
*/

const setSuccess = (state, action) => {
    console.log("SUCCESS", action.type, action.payload);
    return ({
        ...state,
        ...action.payload,
        status: STATUS.OK,
    });
};

const setLoading = (state) => {
    state.status = STATUS.LOADING;
    state.error = null;
}

const setFail = (state, action) => {
    state.current = null;
    state.status = STATUS.FAIL;
    state.error = action.error;
    console.warn("EH!", state.error, action);
}

const addFigure = (extraState = {}) => (state, action) => {
    state.current.figures = {
        ...state.current.figures,
        [state.current.nextId]: {
            ...initFigure,
            ...extraState,
            ...action.payload,
            id: state.current.nextId,
        }
    };
    state.current.currentFigureId = state.current.nextId;
    state.current.nextId += 1;
};

const sceneSlice = createSlice({
    name: 'scene',
    initialState: {
        current: null,
        all: [],
        status: STATUS.IDLE,
        error: null,
    },
    reducers: {
        updateScene: (state, action) => {
            state.current = {
                ...state.current,
                ...action.payload
            };
        },
        addNewFigure: addFigure(),
        addNewPhrase: addFigure({
            type: PHRASE,
            chars: "",
            glyphset: null
        }),
        copyFigure: (state) => {
            const origin = state.current.figures[state.current.currentFigureId];
            state.current.figures[state.current.nextId] = {
                ...origin,
                id: state.current.nextId,
            };
            state.current.currentFigureId = state.current.nextId;
            state.current.nextId += 1;
        },
        deleteFigure: (state, action) => {
            delete state.current.figures[state.current.currentFigureId];
            while (!state.current.figures[--state.current.currentFigureId]) {
                if (state.current.currentFigureId < 0) {
                    state.current.currentFigureId = +Object.keys(state.current.figures)[0];
                    break;
                }
            };
        },
        addParam: (state, action) => {
            if (!action.payload) {
                return;
            }
            state.current.params.push({
                name: action.payload,
                timeScale: 1,
                points: [
                    {x: 0, y: 0},
                    {x: 1, y: 0}
                ]
            });
        },
        deleteParam: (state, action) => {
            state.current.params = state.current.params.filter(it => it.name !== action.payload);
        },
        updateFigure: (state, action) => {
            if (state.current.currentFigureId) {
                state.current.figures[state.current.currentFigureId] = {
                    ...state.current.figures[state.current.currentFigureId],
                    ...action.payload
                }
            }
        },
        updateFigureBy: (state, action) => {
            if (!state.current.currentFigureId) {
                return;
            }
            for (const key in action.payload) {
                state.current.figures[state.current.currentFigureId][key] += action.payload[key];
            }
        },
        addFigureQmd: (state, action) => {
            if (state.current.currentFigureId) {
                state.current.figures[state.current.currentFigureId].qmd
                    .splice(action.payload.index, 0, action.payload.qmd || "");
            }
        },
        deleteFigureQmd: (state, action) => {
            if (state.current.currentFigureId) {
                state.current.figures[state.current.currentFigureId].qmd.splice(action.payload.index, 1);
            }
        },
        updateFigureQmd: (state, action) => {
            if (state.current.currentFigureId) {
                state.current.figures[state.current.currentFigureId].qmd[action.payload.index] = action.payload.qmd;
            }
        },
        updateParam: (state, action) => {
            const index = state.current.params.findIndex(it => it.name === action.payload.name);
            if (index === -1) {
                return;
            }
            state.current.params[index] = {
                ...state.current.params[index],
                ...action.payload,
                name: action.payload.rename || action.payload.name,
            }
        },
        selectById: (state, action) => {
            console.log("SELECT", action.payload);
            const id = +action.payload;
            if (id in state.current.figures) {
                state.current.currentFigureId = id;
            }
            else if (id in state.current.params) {
                state.current.currentParamId = id;
            }
            else {
                console.log("tried to select something with ID", action.payload, " - don't know what this is.");
            }
        },
    },
    extraReducers: {
        [fetchScenes.pending]: setLoading,
        [fetchScenes.fulfilled]: setSuccess,
        [fetchScenes.rejected]: setFail,

        [fetchScene.pending]: setLoading,
        [fetchScene.fulfilled]: setSuccess,
        [fetchScene.rejected]: setFail,

        [addNewScene.fulfilled]: setSuccess,
        [addNewScene.rejected]: setFail,

        [deleteAllScenes.pending]: setLoading,
        [deleteAllScenes.fulfilled]: (state) => ({
            ...state,
            current: null,
            all: [],
            status: STATUS.IDLE,
        }),
        [deleteAllScenes.rejected]: setFail,

        [deleteScene.fulfilled]: setSuccess,
        [deleteScene.rejected]: setFail,

        [reorderScene.fulfilled]: setSuccess,
    }
});

export const {
    updateScene,
    updateFigure,
    updateFigureBy,
    selectById,
    addNewPhrase,
    addNewFigure,
    copyFigure,
    deleteFigure,
    addParam,
    deleteParam,
    updateParam,
    addFigureQmd,
    deleteFigureQmd,
    updateFigureQmd,
} = sceneSlice.actions;

export default sceneSlice.reducer;
