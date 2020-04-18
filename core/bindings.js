import {Attributes} from "../common/common";
import {
    extractVariableFromDottedString,
    getInjectedText, isFunction
} from "../common/helpers";
import {watchValue} from "../common/mobx-helpers";

export const attachBindings = ({domElem, contextValues}) => {
    const observersToDispose = [];
    const binds = domElem.querySelectorAll(Attributes.withBrackets(Attributes.Bind));

    binds.forEach(domElem => {
        let valueToBind = domElem.getAttribute(Attributes.Bind);

        if (!valueToBind) {
            observersToDispose.push(...bindMultipleValues({domElem, contextValues}));
        } else {
            observersToDispose.push(...bindSingleValue({domElem, valueToBind, contextValues}));
        }
    });

    return observersToDispose;
};

const bindMultipleValues = ({domElem, contextValues}) => {
    const observersToDispose = [];
    const template = domElem.innerHTML;
    const getHtmlWithValues = () => getInjectedText(template, contextValues);
    const {text, originalNames, functionParams} = getHtmlWithValues();

    [...originalNames, ...functionParams].forEach(valueToBind => {
        if (!isFunction(valueToBind)) {
            const isDirectValue = valueToBind.indexOf('.') === -1;

            if (isDirectValue) {
                observersToDispose.push(watchValue(contextValues[valueToBind], null, change => {
                    domElem.innerHTML = change.newValue;
                }));
            } else {
                observersToDispose.push(...bindAllNodeValues({domElem, contextValues, valueToBind, getHtmlWithValues}));
            }
        }
    });

    domElem.innerHTML = text;

    return observersToDispose;
};

const bindSingleValue = ({domElem, contextValues, valueToBind}) => {
    const observersToDispose = [];
    const currentValue = extractVariableFromDottedString(valueToBind, contextValues);
    const isDirectValue = valueToBind.indexOf('.') === -1;

    if (isDirectValue) {
        observersToDispose.push(watchValue(contextValues[valueToBind], null, change => {
            domElem.innerHTML = change.newValue;
        }));
    } else {
        const splitString = valueToBind.split('.');
        const objectFieldToWatch = splitString.splice(-1, 1);
        const objectToWatch = extractVariableFromDottedString(splitString.join('.'), contextValues);

        observersToDispose.push(watchValue(objectToWatch, null, change => {
            domElem.innerHTML = objectToWatch[objectFieldToWatch]
        }));
    }

    domElem.innerHTML = currentValue;

    return observersToDispose;
};

const bindAllNodeValues = ({domElem, contextValues, valueToBind, getHtmlWithValues}) => {
    const observersToDispose = [];
    const splitString = valueToBind.split('.');
    splitString.splice(-1, 1);
    const objectToWatch = extractVariableFromDottedString(splitString.join('.'), contextValues);

    observersToDispose.push(watchValue(objectToWatch, null, change => {
        const {text} = getHtmlWithValues();
        domElem.innerHTML = text;
    }));

    return observersToDispose;
}
