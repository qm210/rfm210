export const loadStore = () => {
    const serializedStore = localStorage.getItem('store');
    try {
        return JSON.parse(serializedStore);
    }
    catch (error) {
        console.log("serialized store:", serializedStore, "error:", error);
        return undefined;
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