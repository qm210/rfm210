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
    scale: {
        x: 1,
        y: 1,
    },
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
};

export const selectCurrentFigure = store => store.scene.figures[store.scene.currentFigureId];

const toList = obj => Object.values(obj || {});
export const selectFigureList = store => toList(store.scene.figures);
export const selectSceneList = store => toList(store.scene.all).sort((a,b) => a.order - b.order);

export const fetchScenes = createAsyncThunk('scene/fetchAll', async () => ({
    all: await service().find()
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
    if (!getState().scene.current) {
        return {};
    }
    const current = await service().reorderScene(getState().scene.current, delta);
    const all = await service().find();
    return {current, all};
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

const setSuccess = (state, action) => {
    console.log("SUCESS", action.type, action.payload);
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

const sceneSlice = createSlice({
    name: 'scene',
    initialState: {
        current: null,
        all: [],
        figures: {},
        currentFigureId: null,
        params: {},
        currentParamId: null,
        nextId: 0,
        status: STATUS.IDLE,
        error: null,
    },
    reducers: {
        updateScene: (state, action) => {
            state.current = {
                ...state.current,
                ...action.payload
            }
        },
        addNewFigure: (state, action) => {
            state.figures[state.nextId] = {
                ...initFigure,
                ...action.payload,
                id: state.nextId,
            };
            state.nextId += 1;
        },
        addNewPhrase: (state, action) => {
            state.figures[state.nextId] = {
                ...initFigure,
                type: PHRASE,
                chars: "",
                ...action.payload,
                id: state.nextId,
            };
            state.nextId += 1;
        },
        copyFigure: (state) => {
            const origin = state.figures[state.currentFigureId];
            state.figures[state.nextId] = {
                ...origin,
                id: state.nextId,
            };
            state.currentFigureId = state.nextId;
            state.nextId += 1;
        },
        deleteFigure: (state, action) => {
            delete state.figures[state.currentFigureId];
            state.currentFigureId = null;
        },
        addParam: (state, action) => {
            state.params[action.payload.id] = action.payload;
        },
        deleteParamById: (state, action) => {
            delete state.params[action.payload.id];
        },
        updateFigure: (state, action) => {
            if (state.currentFigureId) {
                state.figures[state.currentFigureId] = {
                    ...state.figures[state.currentFigureId],
                    ...action.payload
                }
            }
        },
        updateParam: (state, action) => {
            state.param[action.payload.id] = {
                ...state.param[action.payload.id],
                ...action.payload,
            }
        },
        selectById: (state, action) => {
            console.log("SELECT", action.payload);
            const id = +action.payload;
            if (id in state.figures) {
                state.currentFigureId = id;
            }
            else if (id in state.params) {
                state.currentParamId = id;
            }
            else {
                console.log("tried to select something with ID", action.payload, " - don't know what this is.");
            }
        }
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
    selectById,
    addNewPhrase,
    addNewFigure,
    copyFigure,
    deleteFigure,
} = sceneSlice.actions;

export default sceneSlice.reducer;
