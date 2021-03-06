import {Attributes} from "../common/common";
import {eventDisposer, getInjectedValuesInText, updateElementAttributesByItem} from "../common/helpers";
import {renderTemplates} from "./templates";
import {bindEventHandlers} from "./events";
import {watchValue} from "../common/mobx-helpers";
import {attachAttributes} from "./attributes";

export const attachRepeats = async ({domElem, contextValues}) => {
    const repeats = domElem.querySelectorAll(Attributes.withBrackets(Attributes.Repeat)), elemEvents = [], observersToDispose = [];

    for (const repeatFatherElem of repeats) {
        const repeatVariableName = repeatFatherElem.getAttribute(Attributes.Repeat);
        const repeatVariableKey = repeatFatherElem.getAttribute(Attributes.RepeatKey);
        const template = repeatFatherElem.querySelector(Attributes.withBrackets(Attributes.RepeatItem));

        repeatFatherElem.removeChild(template);

        const [tempElemEvents, tempObserversDisposers] = await startRepeating({
            repeatFatherElem,
            template,
            contextValues,
            repeatVariableName,
            repeatVariableKey
        });

        elemEvents.push(...tempElemEvents);
        tempObserversDisposers.push(...tempObserversDisposers);
    }

    return [elemEvents, observersToDispose];
};

const customParamExtractor = (repeatVariableKey, index) => {
    return (domElem) => {
        const key = domElem.closest(Attributes.withBrackets(Attributes.RepeatItemKey)).getAttribute(Attributes.RepeatItemKey);
        return (currentValues, varName) => {
            if (Array.isArray(currentValues)) {
                return repeatVariableKey ? currentValues.find(item => item[repeatVariableKey] === key) : currentValues[key];
            }
            if (varName.includes('$index')) {
                return index;
            }


            return currentValues;
        }
    };
};

const startRepeating = async ({repeatFatherElem, template, contextValues, repeatVariableName, repeatVariableKey}) => {
    // reset event handlers
    let eventToDisposeHandler;

    if (!repeatVariableKey) {
        eventToDisposeHandler = removeItemsPhase(repeatFatherElem)
    }

    const elemEvents = [], observersToDispose = [];

    const _handleRepeatItem = handleRepeatItem({
        repeatFatherElem,
        template,
        repeatVariableKey,
        contextValues
    });

    const [allItemsElemEvents, allItemsObserverDispoers] = await handleAllRepeatItems({
        repeatList: contextValues[repeatVariableName],
        handleRepeatItem: _handleRepeatItem
    });

    elemEvents.push(...allItemsElemEvents);
    observersToDispose.push(...allItemsObserverDispoers);

    // list
    const listObserver = watchValue(contextValues, repeatVariableName, change => {
        if (!repeatVariableKey) {
            const removeOldEvents = eventToDisposeHandler({
                observersToDispose,
                elemEvents
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
            if (change.removed.length) {
                change.removed.forEach(removedItem => {
                    const removedChild = repeatFatherElem.querySelector(Attributes.withBracketsValue(Attributes.RepeatItemKey, removedItem[repeatVariableKey]));
                    repeatFatherElem.removeChild(removedChild);
                });
            } else if (change.added.length) {
                change.added.forEach(newItem => {
                    _handleRepeatItem(newItem, change.object.indexOf(newItem));
                });
            }
        }
    });

    observersToDispose.push(listObserver);

    return [elemEvents, observersToDispose];
};

const handleAllRepeatItems = async ({repeatList, handleRepeatItem}) => {
    const elemEvents = [], observersToDispose = [];
    const promiseTemplateIsReadyToLoad = [];

    repeatList.forEach((item, index) => {
        const currentPromise = handleRepeatItem(item, index).then(([deadEvents, deadObservers]) => {
            elemEvents.push(...deadEvents);
            observersToDispose.push(...deadObservers);
        });

        promiseTemplateIsReadyToLoad.push(currentPromise)
    });

    await Promise.all(promiseTemplateIsReadyToLoad);

    return [elemEvents, observersToDispose];
};

const handleRepeatItem = ({repeatFatherElem, template, contextValues, repeatVariableKey}) => {
    const observersToDispose = [], elemEvents = [];

    return async (item, index) => {
        const tempDom = template.cloneNode(true);
        const _customParamExtractor = customParamExtractor(repeatVariableKey, index);
        tempDom.setAttribute(Attributes.RepeatItemKey, repeatVariableKey ? item[repeatVariableKey] : index);
        const _handleDomItem = handleDomItem({
            domToUpdate: tempDom,
            contextValues,
            repeatFatherElem,
            template,
            index,
            item,
            customParamExtractor: _customParamExtractor
        });

        const _updateElem = async () => {
            const [deadElement] = await _handleDomItem();
            elemEvents.push(...deadElement);
        };

        await _updateElem();

        const elemObserver = watchValue(item, null, async () => {
            await _updateElem();
        });

        observersToDispose.push(elemObserver);

        return [elemEvents, observersToDispose];
    }
};

const handleDomItem = ({item, index, repeatFatherElem, template, contextValues, customParamExtractor, domToUpdate: domElem}) => {
    const elemEvents = [];

    return async () => {
        domElem.innerHTML = getInjectedValuesInText(template.innerHTML, item, () => index);

        // appends child so we can render template right away
        // if already appended don't again :D
        if (domElem.parentElement === null) {
            repeatFatherElem.appendChild(domElem);
        }

        //render renderTemplates of repeates
        await renderTemplates({
            contextValues,
            domElem,
            customValues: item
        });

        //bind event handlers
        elemEvents.push(...bindEventHandlers({
            domElem,
            elemEvents,
            contextValues,
            customValues: item,
            customParamExtractor
        }));

        //attach attributes
        attachAttributes({domElem, contextValues});

        //update attributes
        updateElementAttributesByItem({
            domElement: domElem,
            item
        });

        return [elemEvents];
    }
};

const removeItemsPhase = (repeatFatherElem) => {
    repeatFatherElem.querySelectorAll(Attributes.withBrackets(Attributes.RepeatItem)).forEach(kid => repeatFatherElem.removeChild(kid));

    return ({observersToDispose, elemEvents}) => eventDisposer({observersToDispose, elemEvents})
};
