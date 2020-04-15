import {Attributes} from "../common/common";
import {bindEventHandlers} from "./events";
import {
    eventDisposer,
} from "../common/helpers";
import {mobContext} from "./context";
import {loadTemplates} from "./load-templates";
import {injectInitialValues} from "./initial-values";
import {attachBindings} from "./bindings";
import {attachRepeats} from "./repeats";

export const createUiBlock = async (name, fn, options) => {
    const {injectedParams, customName} = options || {};
    console.time(`takeByAttrAll-` + (customName || name))
    let domElem;

    if (customName) {
        domElem = document.querySelector(Attributes.withBracketsValue(Attributes.RepeatBlock, (customName || name)));
    } else {
        domElem = document.querySelector(Attributes.withBracketsValue(Attributes.Block, (customName || name)));

    }

    if (!domElem) {
        mobContext.uiBlocks[name] = {
            invoke: createUiBlock.bind(this, name, fn),
            id: name,
        };
        return;
    }

    const observersToDispose = [], elemEvents = [];

    const contextValues = await fn(injectedParams);

    //set block ready - move to bottom
    domElem.setAttribute(Attributes.Ready, 'true');

    //load if any tempaltes
    await loadTemplates({domElem, contextValues});

    // bind all event handlers
    bindEventHandlers({
        domElem: domElem,
        contextValues,
        elemEvents
    });

    // injects initial values
    injectInitialValues({domElem, contextValues});

    //attach bindings
    attachBindings({domElem, contextValues, observersToDispose});

    // attach repeats
    await attachRepeats({domElem, contextValues, observersToDispose, elemEvents});

    console.timeEnd(`takeByAttrAll-` + (customName || name))

    return eventDisposer({elemEvents, observersToDispose});
};
