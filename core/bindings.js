import {Attributes} from "../common/common";
import {getInjectedText} from "../common/helpers";
import {watchValue} from "../common/mobx-helpers";

export const attachBindings = ({domElem, contextValues, observersToDispose}) => {
    const binds = domElem.querySelectorAll(Attributes.withBrackets(Attributes.Bind));

    binds.forEach(domElem => {
        let valueToBind = domElem.getAttribute(Attributes.Bind);

        if (!valueToBind) {
            bindMultipleValues({domElem, contextValues, observersToDispose});
        } else {
            bindSingleValue({domElem, valueToBind, contextValues, observersToDispose});
        }
    });
};

const bindSingleValue = ({domElem, valueToBind, contextValues, observersToDispose}) => {
    observersToDispose.push(watchValue(contextValues, valueToBind, change => {
        domElem.textContent = change.newValue;
    }));

    domElem.textContent = contextValues[valueToBind];
}

const bindMultipleValues = ({domElem, contextValues, observersToDispose}) => {
    const template = domElem.innerHTML;
    const {variableNames, text} = getInjectedText(template, contextValues);

    variableNames.forEach(varName => {
        observersToDispose.push(watchValue(contextValues, varName, () => {
            const {text} = getInjectedText(template, contextValues);
            domElem.textContent = text;
        }));
    })

    domElem.textContent = text;
}
