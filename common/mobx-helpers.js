import {observe} from "mobx";
import {libraryPrefix} from "./common";

export const watchValue = (items, valueToWatch, fn) => {
    try {
        return valueToWatch ? observe(items[valueToWatch], fn) : observe(items, fn);
    } catch (e) {
        console.warn(`[${libraryPrefix}-error] Missing value in returned object, won't get any updates for ${valueToWatch}`);
    }
};
