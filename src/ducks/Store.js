import Initial from "../Initial";

export const [CLEAR_GLYPHSETS, APPEND_GLYPHSET, PURGE_GLYPHSETS] = [...Array(99).keys()];

const Reducer = (state = Initial.storeState, {type, payload}) => {
    switch (type) {

        case APPEND_GLYPHSET:
            return state.alphabets.includes(payload)
                ? state
                : {...state, alphabets: [...state.alphabets, payload]};

        case CLEAR_GLYPHSETS:
            return {...state, alphabets: []}

        case PURGE_GLYPHSETS:
            return state; // implement later

        default:
            return state;
    }
}

export default Reducer;
