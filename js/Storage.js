export const Storage = {
    save(key, data) {
        try { localStorage.setItem('vw_' + key, JSON.stringify(data)); } catch (e) {}
    },
    load(key, defaultData) {
        try {
            const data = localStorage.getItem('vw_' + key);
            return data ? JSON.parse(data) : defaultData;
        } catch (e) { return defaultData; }
    },
    clear() {
        Object.keys(localStorage).forEach(key => {
            if(key.startsWith('vw_')) localStorage.removeItem(key);
        });
    }
};
              
