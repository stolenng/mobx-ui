import {Attributes} from "../common/common";
import {getPropertyNameByInputType, getVariableInCurlyBracelets} from "../common/helpers";

export const injectInitialValues = ({domElem, contextValues}) => {
    const initialValuesModels = domElem.querySelectorAll(Attributes.withBrackets(Attributes.InitialValue));

    initialValuesModels.forEach(domElem => {
        const fieldType = domElem.getAttribute('type');
        const bindName = domElem.getAttribute(Attributes.InitialValue);

        const value = getVariableInCurlyBracelets(bindName, contextValues);
        const propertyName = getPropertyNameByInputType(fieldType);

        domElem[propertyName] = value;
    });
};
