const dot = (obj: any) => {
    const result: any = {};

    Object.entries(obj).forEach(([key, value]) => {
        const keys = key.split('.');

        let currentObj = result;

        for (let i = 0; i < keys.length - 1; i++) {
            const currentKey = keys[i];

            if (!(currentKey in currentObj)) {
                currentObj[currentKey] = {};
            }

            currentObj = currentObj[currentKey];
        }

        currentObj[keys[keys.length - 1]] = value;
    });

    return result;
};

export {
    dot,
}