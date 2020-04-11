import {getLibraryEventName, libraryPrefix} from "../common/common";
import {checkIfParamsInStringFunctionString} from "../common/helpers";

export const createEventCall = ({eventName, domElem, contextValues, customValues, paramExtractor}) => {
    return (e) => {
        const usedValues = customValues ? customValues : contextValues;
        const functionString = domElem.getAttribute(getLibraryEventName(eventName));
        const funcName = functionString.split('(')[0];
        const {hasParams, params} = checkIfParamsInStringFunctionString(functionString, usedValues, paramExtractor);

        try {
            if (hasParams) {
                contextValues[funcName](e, ...params);
            } else {
                contextValues[funcName](e, domElem.value);
            }
        } catch (e) {
            console.error(`[${libraryPrefix}-error] Missing value in returned object!, defineUiBlock should return all used values/functions`, e);
        }
    }
};
