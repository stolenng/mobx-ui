import {Attributes, eventList, getLibraryEventName, libraryPrefix} from "../common/common";
import {checkIfParamsInStringFunctionString, getFunctionNameFromString} from "../common/helpers";

export const createEventCall = ({eventName, domElem, contextValues, customValues, paramExtractor}) => {
    return (e) => {
        const usedValues = customValues ? customValues : contextValues;
        const functionString = domElem.getAttribute(getLibraryEventName(eventName));
        const funcName = getFunctionNameFromString(functionString);
        const {hasParams, params} = checkIfParamsInStringFunctionString(functionString, usedValues, paramExtractor);
        debugger;
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

export const bindEventHandlers = ({domElem, contextValues, customValues, customParamExtractor}) => {
    const elemEvents = [];

    eventList.forEach(eventName => {
        const models = domElem.querySelectorAll(Attributes.withBrackets(getLibraryEventName(eventName)));

        models.forEach(domElem => {
            const paramExtractor = customParamExtractor ? customParamExtractor(domElem) : null;
            const newEventHandler = createEventCall({eventName, domElem, contextValues, paramExtractor, customValues});
            domElem.addEventListener(eventName, newEventHandler);

            const elemEvent = {
                eventType: eventName,
                fn: newEventHandler,
                elem: domElem
            };
            elemEvents.push(elemEvent);
        });
    });

    return elemEvents;
};
