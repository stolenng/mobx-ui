import {observe} from "mobx";

export const watchValue = (items, valueToWatch, fn) => {
    try {
        return observe(items[valueToWatch], fn);
    } catch (e) {
        console.error(`[${libraryPrefix}-error] Missing value in returned object!, defineUiBlock should return ${valueToWatch}`, e);
    }
};
