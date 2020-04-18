import {Attributes} from "../common/common";
import {bindEventHandlers} from "./events";
import {
    eventDisposer,
} from "../common/helpers";
import {mobContext} from "./context";
import {renderTemplates} from "./templates";
import {injectInitialValues} from "./initial-values";
import {attachBindings} from "./bindings";
import {attachRepeats} from "./repeats";
import {attachAttributes} from "./attributes";

export const createUiBlock = async (name, fn, options = {}) => {
    const {injectedParams, blockId} = options;
    // console.time(`takeByAttrAll-` + (blockId || name))
    let domElem =  document.querySelector(Attributes.withBracketsValue(Attributes.RepeatBlockId, (blockId || name)));

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
    await renderTemplates({domElem, contextValues});

    // bind all event handlers
    elemEvents.push(
        ...bindEventHandlers({
            domElem: domElem,
            contextValues,
            elemEvents
        })
    );

    //attach attributes
    observersToDispose.push(...attachAttributes({domElem, contextValues}));

    // injects initial values
    injectInitialValues({domElem, contextValues});

    //attach bindings
    observersToDispose.push(
        ...attachBindings({domElem, contextValues, observersToDispose})
    );

    // attach repeats
    await attachRepeats({
        domElem,
        contextValues,
        observersToDispose,
        elemEvents
    }).then(([tempElemEvents, tempObserversDisposers]) => {
        elemEvents.push(...tempElemEvents);
        tempObserversDisposers.push(...tempObserversDisposers);
    });

    if (contextValues.afterRender && typeof contextValues.afterRender === 'function') {
        contextValues.afterRender();
    }

    // console.timeEnd(`takeByAttrAll-` + (blockId || name))

    return eventDisposer({elemEvents, observersToDispose});
};
