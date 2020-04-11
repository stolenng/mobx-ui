import {eventList, getLibraryEventName, libraryPrefix} from "../common/common";
import {createEventCall} from "./events";
import {
    getInjectedValuesInText,
    getVariableInCurlyBracelets,
    getInjectedText
} from "../common/helpers";
import {observe} from "mobx";
import {watchValue} from "../common/mobx-helpers";
import {mobContext} from "./context";
import {loadTemplates} from "./load-templates";

export const defineUiBlock = async (name, fn, injectedParams, customName) => {
    console.time(`takeByAttrAll-`+(customName || name))

    let parentElem;

    if (customName) {
        parentElem = document.querySelector(`[${libraryPrefix}-repeat-block="${customName}"]`);
    } else {
        parentElem = document.querySelector(`[${libraryPrefix}-block="${name}"]`);
    }

    if (!parentElem) {
        mobContext.uiBlocks[name] = {
            invoke: defineUiBlock.bind(this, name, fn),
            id: name,
        };
        return;
    } else {
        // maybe delete it someday
        // delete mobContext.uiBlocks[name];
    }

    const observers = [];
    const elemEvents = [];
    const contextValues =  await fn(injectedParams);
    parentElem.setAttribute(`${libraryPrefix}-ready`, 'true');
    await loadTemplates(parentElem, contextValues);

    //maybe loadTemplates here

    const bindEventHandlers = (customElem, customValues, customParamExtractor) => {
        // event handlers
        eventList.forEach(eventName => {
            const searchElem = customElem ? customElem : parentElem;
            const models = searchElem.querySelectorAll(`[${getLibraryEventName(eventName)}]`);

            models.forEach(domElem => {
                const paramExtractor = customParamExtractor ? customParamExtractor(domElem) : null;
                const newEventHandler = createEventCall({eventName, domElem, contextValues, paramExtractor, customValues});
                domElem.addEventListener(eventName, newEventHandler);

                elemEvents.push({
                    eventType: eventName,
                    fn: newEventHandler,
                    elem: domElem
                });
            });
        });
    };

    bindEventHandlers();

    const initialValuesModels = parentElem.querySelectorAll(`[${libraryPrefix}-init-value]`);
    const binds = parentElem.querySelectorAll(`[${libraryPrefix}-bind]`);
    const repeats = parentElem.querySelectorAll(`[${libraryPrefix}-repeat]`);

    initialValuesModels.forEach(domElem => {
        const fieldType = domElem.getAttribute('type');
        const bindName = domElem.getAttribute(`${libraryPrefix}-init-value`);

        const value = getVariableInCurlyBracelets(bindName, contextValues);

        if (fieldType === 'checkbox') {
            domElem.checked = value;
        } else {
            domElem.value = value;
        }
    })

    binds.forEach(domElem => {
        let valueToBind = domElem.getAttribute(`${libraryPrefix}-bind`);
        let variableNames = [];

        if (!valueToBind) {
            const doSomething = () => {
                const template = domElem.innerHTML;
                const {variableNames: varRes, text} = getInjectedText(template, contextValues);

                variableNames =varRes;
                valueToBind = text;


                variableNames.forEach(varName => {
                    observers.push(observe(contextValues[varName], change => {
                        const { text} = getInjectedText(template, contextValues);
                        domElem.textContent = text;
                    }));
                })
            };

            doSomething();
        } else {
            observers.push(watchValue(contextValues, valueToBind, change => {
                domElem.textContent = change.newValue;
            }));

            valueToBind = contextValues[valueToBind];
        }

        domElem.textContent = valueToBind;
    });

    repeats.forEach(repeatFatherElem => {
        const repeatVariableName = repeatFatherElem.getAttribute(`${libraryPrefix}-repeat`);
        const repeatVariableKey = repeatFatherElem.getAttribute(`${libraryPrefix}-repeat-key`);
        const template = repeatFatherElem.querySelector(`[${libraryPrefix}-repeat-item]`);
        const itemRepeatKey = `${libraryPrefix}-repeat-item`;
        repeatFatherElem.removeChild(template);

        const updateDom = async () => {
            repeatFatherElem.querySelectorAll(`[${itemRepeatKey}]`).forEach(kid => repeatFatherElem.removeChild(kid));
            contextValues[repeatVariableName].forEach((item, index) => {
                const tempDom = template.cloneNode(true);
                tempDom.setAttribute(`${itemRepeatKey}-key`, repeatVariableKey ? item[repeatVariableKey] : index)
                tempDom.innerHTML = getInjectedValuesInText(tempDom.innerHTML, item);

                const attrKeys = Object.keys(tempDom.attributes);
                attrKeys.forEach(attrKey => tempDom.attributes[attrKey].value = getInjectedValuesInText(tempDom.attributes[attrKey].value, item));
                repeatFatherElem.appendChild(tempDom);


                //watch single item
                // dont create too much watcehrs - remove each time or attach once depend on key or index rendering
                observers.push(observe(item, change => {
                    updateDom();
                }));
            });

            await loadTemplates(repeatFatherElem, contextValues);

            bindEventHandlers(
                repeatFatherElem,
                contextValues[repeatVariableName],
                (domElem) => {
                    const key = domElem.getAttribute(`${itemRepeatKey}-key`);

                    return (currentValues) => {
                        return repeatVariableKey ? currentValues.find(item => item[repeatVariableKey] === key) : currentValues[key];
                    }
                }
            );
        };

        //watch-list
        observers.push(observe(contextValues[repeatVariableName], change => {
            updateDom();
        }));

        updateDom();
    });


    console.timeEnd(`takeByAttrAll-`+(customName || name))


    return () => {
        observers.forEach(observer => observer());

        elemEvents.forEach(elemEvent => {
            elemEvent.elem.removeEventListener(elemEvent.eventType, elemEvent.fn)
        });
    }

};
