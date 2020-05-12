export const loadState = () => {
    try {
        const serializedStore = localStorage.getItem('store');
        if (serializedStore === null) {
            return undefined;
        }
        return JSON.parse(serializedStore);
    }
    catch (error) {
        console.error(error);
    }
}

export const saveState = (store) => {
    try {
        const serializedStore = JSON.stringify(store);
        localStorage.setItem('store', serializedStore);
    }
    catch (error) {
        console.error(error);
    }
}