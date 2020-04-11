import {Attributes, libraryPrefix} from "../common/common";
import {getInjectedValuesInText} from "../common/helpers";
import {observe} from "mobx";
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

        const updateDom = async () => {
            repeatFatherElem.querySelectorAll(Attributes.withBrackets(Attributes.RepeatItem)).forEach(kid => repeatFatherElem.removeChild(kid));
            contextValues[repeatVariableName].forEach((item, index) => {
                const tempDom = template.cloneNode(true);
                tempDom.setAttribute(Attributes.RepeatItemKey, repeatVariableKey ? item[repeatVariableKey] : index)
                tempDom.innerHTML = getInjectedValuesInText(tempDom.innerHTML, item);

                const attrKeys = Object.keys(tempDom.attributes);
                attrKeys.forEach(attrKey => tempDom.attributes[attrKey].value = getInjectedValuesInText(tempDom.attributes[attrKey].value, item));
                repeatFatherElem.appendChild(tempDom);


                //watch single item
                // dont create too much watcehrs - remove each time or attach once depend on key or index rendering
                observersToDispose.push(watchValue(item, null,change => {
                    updateDom();
                }));
            });

            await loadTemplates({
                contextValues,
                domElem: repeatFatherElem,
                customValues: contextValues[repeatVariableName]
            });

            bindEventHandlers({
                elemEvents,
                domElem: repeatFatherElem,
                contextValues,
                customValues: contextValues[repeatVariableName],
                customParamExtractor: (domElem) => {
                    const key = domElem.closest(Attributes.withBrackets(Attributes.RepeatItemKey)).getAttribute(Attributes.RepeatItemKey);

                    return (currentValues) => repeatVariableKey ? currentValues.find(item => item[repeatVariableKey] === key) : currentValues[key];
                }
            });
        };

        //watch-list
        observersToDispose.push(watchValue(contextValues, repeatVariableName, change => {
            updateDom();
        }));

        updateDom();
    });
}
