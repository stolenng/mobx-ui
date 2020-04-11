import {Attributes, libraryPrefix} from "../common/common";
import {mobContext} from "./context";

const loadedTemplates = {};
const inProcessRequests = {};

export const loadTemplates = async ({domElem, contextValues, customValues}) => {
    const templates = domElem ? domElem.querySelectorAll(Attributes.withBrackets(Attributes.Template)) : document.querySelectorAll(Attributes.withBrackets(Attributes.Template));

    for (let template of templates) {
        const isLoaded = template.getAttribute(Attributes.Loaded);

        if (!isLoaded) {
            const templatePath = template.getAttribute(Attributes.Template);

            const templateDom = await fetchTemplate(templatePath)
            invokeUiBlocks(template, templateDom, contextValues, customValues);
        }
    }
}

const invokeUiBlocks = (template, templateDom, contextValues, customValues) => {
    const newElem = document.createElement('div');
    newElem.innerHTML = templateDom;
    template.appendChild(newElem);

    const templateParams = [];
    for (const attr of template.attributes) {
        if (attr.name.includes(Attributes.Param)) {
            templateParams.push({name: attr.name, value: attr.value});
        }
    }
    console.log(templateParams)

    const uiBlocks = document.querySelectorAll(Attributes.withBrackets(Attributes.Block));
    uiBlocks.forEach(blockElem => {
        const blockName = blockElem.getAttribute(Attributes.Block);

        if (blockElem.getAttribute(Attributes.Ready) !== 'true') {
            const isPartOfRepeatTemplate = blockElem.closest(Attributes.withBrackets(Attributes.RepeatItem));

            if (isPartOfRepeatTemplate) {
                const blockKey = blockElem.closest(Attributes.withBrackets(Attributes.RepeatItem)).getAttribute(Attributes.RepeatItemKey);
                const newRepeatBlockKey = `${blockName}-${blockKey}`;


                // to avoid rendering list items and let it decide when to render
                if (blockKey) {
                    blockElem.setAttribute(Attributes.RepeatBlock, newRepeatBlockKey)
                    mobContext.uiBlocks[blockName].invoke({injectedParams: contextValues, customName: newRepeatBlockKey});
                    template.setAttribute(Attributes.Loaded, true);
                } else {
                    console.warn(`[${libraryPrefix}] - missing ${blockName} key`);
                }
            } else {
                mobContext.uiBlocks[blockName].invoke({injectedParams: contextValues});
                template.setAttribute(Attributes.Loaded, true);

            }
        }
    });
    template.style.display = 'block';
};

const fetchTemplate = (templatePath) => {
    if (inProcessRequests[templatePath]) {
        return inProcessRequests[templatePath];
    }
    if (loadedTemplates[templatePath]) {
        return Promise.resolve(loadedTemplates[templatePath]);
    }

    const currentPromise = new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', templatePath, true);
        xhr.onreadystatechange = function () {
            if (this.status !== 200) {
                reject('Failed to Fetch');
            }

            if (this.readyState === 4) {
                loadedTemplates[templatePath] = this.response;
                delete inProcessRequests[templatePath];
                resolve(this.response);
            }
        };

        xhr.send();
    });

    inProcessRequests[templatePath] = currentPromise;

    return currentPromise;
}
