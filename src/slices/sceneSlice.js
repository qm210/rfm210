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

export const fetchScenes = createAsyncThunk('scene/fetchAll', async () =>
    await service().find()
);

export const fetchScene = createAsyncThunk('scene/fetch', async (id) =>
    await service().get(id)
);

export const addNewScene = createAsyncThunk('scene/add', async (data, {getState}) => {
    const current = getState().scene.current;
    const newScene = await service().create({
        order: current ? current.order + 1 : null,
        ...data
    });
    const allScenes = (await service().find()).data;
    return {current: newScene, all: allScenes};
});

export const reorderScene = createAsyncThunk('scene/reorder', async (data, {getState}) => ({
    current: await service().reorderScene(getState().scene.current, data),
    all: await service().find()
}), {
    condition: (_, {getState}) => !!getState().scene.current
});

export const deleteScene = createAsyncThunk('scene/delete', async ({getState, dispatch}) => {
    const removed = await service().remove(getState().current.id);
    dispatch(fetchScenes());
    return removed;
});

export const deleteAllScenes = createAsyncThunk('scenes/clear', async () =>
    await service().remove(null)
);

const actionFulfilled = (state, action) => ({
    ...state,
    ...action.payload,
    status: STATUS.OK
});

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
        [fetchScenes.pending]: (state) => {
            state.status = STATUS.LOADING;
        },
        [fetchScenes.fulfilled]: (state, action) => {
            state.all = action.payload.data;
            state.status = STATUS.OK;
        },
        [addNewScene.fulfilled]: actionFulfilled,
        [addNewScene.rejected]: (state, action) => {
            state.current = null;
            state.status = STATUS.FAIL;
        },
        [deleteScene.fulfilled]: (state, action) => {
            console.log("Deleted, and now..?", action);
        },
        [deleteAllScenes.fulfilled]: (state) => {
            state.status = STATUS.IDLE;
            state.all = [];
            state.current = null;
        },
        [reorderScene.fulfilled]: actionFulfilled,
    }
});

export const {
    updateScene,
    updateFigure,
    selectById,
    addNewPhrase,
    addNewFigure,
    copyFigure,
    deleteFigure
} = sceneSlice.actions;

export default sceneSlice.reducer;
