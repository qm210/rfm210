import Initial from "../Initial";

export const clearAlphabets = () => ({type: 'CLEAR_ALPHABETS'});
export const appendAlphabet = (name) => ({type: 'APPEND_ALPHABET', payload: name});
export const assignAlphabet = (name) => ({type: 'ASSIGN_ALPHABET', payload: name});
export const purgeEmptyAlphabets = () => ({type: 'PURGE_ALPHABETS'});

export const setWidth = (value) => ({type: 'SET_WIDTH', payload: value});
export const setHeight = (value) => ({type: 'SET_HEIGHT', payload: value});
export const setLetter = (value) => ({type: 'SET_LETTER', payload: value});

const Reducer = (state = Initial.glyphState, {type, payload}) => {
    switch (type) {
        case 'SET_LETTER':
            return {...state, letter: payload};
        case 'SET_WIDTH':
            return {...state, width: payload};
        case 'SET_HEIGHT':
            return {...state, height: payload};
        case 'ASSIGN_ALPHABET':
            const alphabet = state.alphabets.includes(payload) ? payload : null;
            return {...state, alphabet};

        case 'APPEND_ALPHABET':
            return state.alphabets.includes(payload)
                ? state
                : {...state, alphabets: [...state.alphabets, payload]};
        case 'CLEAR_ALPHABETS':
            return {...state, alphabets: []}

        case 'PURGE_ALPHABETS':
            return state; // implement later

        default:
            return state;
    }
}

export default Reducer;
