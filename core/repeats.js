import {Attributes} from "../common/common";
import {eventDisposer, getInjectedValuesInText} from "../common/helpers";
import {loadTemplates} from "./load-templates";
import {bindEventHandlers} from "./events";
import {watchValue} from "../common/mobx-helpers";

export const attachRepeats = async ({domElem, contextValues, observersToDispose, elemEvents}) => {
    const repeats = domElem.querySelectorAll(Attributes.withBrackets(Attributes.Repeat));

    repeats.forEach(repeatFatherElem => {
        const repeatVariableName = repeatFatherElem.getAttribute(Attributes.Repeat);
        const repeatVariableKey = repeatFatherElem.getAttribute(Attributes.RepeatKey);
        const template = repeatFatherElem.querySelector(Attributes.withBrackets(Attributes.RepeatItem));

        repeatFatherElem.removeChild(template);

        startRepeating({
            repeatFatherElem,
            template,
            contextValues,
            repeatVariableName,
            repeatVariableKey,
            observersToDispose,
            elemEvents
        });
    });
}

const customParamExtractorCaller = (repeatVariableKey) => {
    return (domElem) => {
        const key = domElem.closest(Attributes.withBrackets(Attributes.RepeatItemKey)).getAttribute(Attributes.RepeatItemKey);
        return (currentValues) => repeatVariableKey ? currentValues.find(item => item[repeatVariableKey] === key) : currentValues[key];
    };
}

const startRepeating = async ({repeatFatherElem, template, contextValues, repeatVariableName, repeatVariableKey, observersToDispose, elemEvents}) => {
    // reset event handlers
    let eventToDisposeHandler;

    if (!repeatVariableKey) {
        eventToDisposeHandler = removeItemsPhase(repeatFatherElem)
    }
    const tempObserverEvents = [];
    let tempElemEvents;

    const customParamExtractor = customParamExtractorCaller(repeatVariableKey)

    const handleRepeatItem = handleRepeatItemIterator({
        repeatFatherElem,
        template,
        repeatVariableKey,
        contextValues,
        elemEvents,
        customParamExtractor,
        tempObserverEvents,
        observersToDispose
    });

    const promiseTemplateIsReadyToLoad = [];
    contextValues[repeatVariableName].forEach((item, index) => promiseTemplateIsReadyToLoad.push(handleRepeatItem(item, index)));

    await Promise.all(promiseTemplateIsReadyToLoad);

    await loadTemplates({
        contextValues,
        domElem: repeatFatherElem,
        customValues: contextValues[repeatVariableName]
    });

    tempElemEvents = bindEventHandlers({
        elemEvents,
        domElem: repeatFatherElem,
        contextValues,
        customValues: contextValues[repeatVariableName],
        customParamExtractor
    });

    // list
    const listObserver = watchValue(contextValues, repeatVariableName, change => {
        if (!repeatVariableKey) {
            const removeOldEvents = eventToDisposeHandler({
                observersToDispose: tempObserverEvents,
                elemEvents: tempElemEvents
            });
            removeOldEvents();
            startRepeating({
                repeatFatherElem,
                template,
                contextValues,
                repeatVariableName,
                repeatVariableKey,
                observersToDispose,
                elemEvents
            });
        } else {
            const newItem = change.added[0];
            console.log(newItem);
            handleRepeatItem(newItem);
        }
    });

    observersToDispose.push(listObserver);
    tempObserverEvents.push(listObserver);
};

const handleRepeatItemIterator = ({repeatFatherElem, template, customParamExtractor, elemEvents, contextValues, repeatVariableKey, tempObserverEvents, observersToDispose}) => {
    return async (item, index) => {
        const tempDom = template.cloneNode(true);
        tempDom.setAttribute(Attributes.RepeatItemKey, repeatVariableKey ? item[repeatVariableKey] : index)

        await updateDomElem({
            domToUpdate: tempDom,
            contextValues,
            template,
            item
        });

        repeatFatherElem.appendChild(tempDom);

        const elemObserver = watchValue(item, null, async () => {
            await updateDomElem({
                item,
                template,
                elemEvents,
                contextValues,
                customParamExtractor,
                domToUpdate: tempDom,
                options: {
                    shouldLoadTemplates: true,
                    shouldBindEvents: true
                }
            })
        });

        tempObserverEvents.push(elemObserver);
        observersToDispose.push(elemObserver);
    }
};

const updateDomElem = async ({item, template, contextValues, customParamExtractor, domToUpdate, elemEvents, options}) => {
    const {shouldLoadTemplates, shouldBindEvents} = options || {};
    domToUpdate.innerHTML = getInjectedValuesInText(template.innerHTML, item);

    if (shouldLoadTemplates) {
        await loadTemplates({
            contextValues,
            domElem: domToUpdate,
            customValues: item
        });
    }

    if (shouldBindEvents) {
        bindEventHandlers({
            elemEvents,
            domElem: domToUpdate,
            contextValues,
            customValues: item,
            customParamExtractor
        });
    }

    const attrKeys = Object.keys(domToUpdate.attributes);
    attrKeys.forEach(attrKey => domToUpdate.attributes[attrKey].value = getInjectedValuesInText(domToUpdate.attributes[attrKey].value, item));
};

const removeItemsPhase = (repeatFatherElem) => {
    repeatFatherElem.querySelectorAll(Attributes.withBrackets(Attributes.RepeatItem)).forEach(kid => repeatFatherElem.removeChild(kid));

    return ({observersToDispose, elemEvents}) => eventDisposer({observersToDispose, elemEvents})
};
