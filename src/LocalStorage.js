export const loadStore = () => {
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
};

export const saveStore = (store) => {
    try {
        const serializedStore = JSON.stringify(store);
        localStorage.setItem('store', serializedStore);
    }
    catch (error) {
        console.error(error);
    }
};

export const clearStore = () => {
    localStorage.removeItem('store');
    window.location.reload();
};