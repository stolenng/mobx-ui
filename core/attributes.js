import {extractVariableFromDottedString} from "../common/helpers";
import {watchValue} from "../common/mobx-helpers";
import {Attributes, attributesList, eventList, getLibraryAttributeName, getLibraryEventName} from "../common/common";
import {createEventCall} from "./events";

export const attachAttributes = ({domElem, contextValues}) => {
    const observersToDispose = [];

    attributesList.forEach(attributeName => {
        const elements = domElem.querySelectorAll(Attributes.withBrackets(getLibraryAttributeName(attributeName)));

        elements.forEach(domElem => {
            for (const attr of domElem.attributes) {
                if (attr.name === getLibraryAttributeName(attributeName)) {
                    if (attr.value && attr.value.length > 0) {
                        const attrNameToBind = attr.name.split('-')[1];
                        const valueToInsert = extractVariableFromDottedString(attr.value, contextValues)
                        // const isDirectValue = attr.value.indexOf('.') === -1;

                        // if (isDirectValue) {
                        //     observersToDispose.push(watchValue(contextValues[attr.value], null, change => {
                        //         domElem.innerHTML = change.newValue;
                        //     }));
                        // } else {
                        //     const splitString = attr.value.split('.');
                        //     const objectFieldToWatch = splitString.splice(-1, 1);
                        //     const objectToWatch = extractVariableFromDottedString(splitString.join('.'), contextValues);
                        //
                        //     observersToDispose.push(watchValue(objectToWatch, null, change => {
                        //         domElem.setAttribute(attrNameToBind, objectToWatch[objectFieldToWatch]);
                        //     }));
                        // }

                        domElem.setAttribute(attrNameToBind, valueToInsert);
                    }
                }
            }
        });
    });

    return observersToDispose;
}
