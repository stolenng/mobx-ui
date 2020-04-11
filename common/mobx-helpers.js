import {observe} from "mobx";

export const watchValue = (items, valueToWatch, fn) => {
    try {
        return valueToWatch ? observe(items[valueToWatch], fn) : observe(items, fn);
    } catch (e) {
        console.error(`[${libraryPrefix}-error] Missing value in returned object!, defineUiBlock should return ${valueToWatch || items}`, e);
    }
};
