import {Attributes} from "../common/common";
import {mobContext} from "./context";
import {extractVariableFromDottedString, generateId} from "../common/helpers";

const loadedTemplates = {};
const inProcessRequests = {};

export const initUiBlocks = ({domElem} = {}) => {
    renderTemplates({domElem});
}

export const renderTemplates = async ({domElem, contextValues, customValues}) => {
    let templates = domElem ? domElem.querySelectorAll(Attributes.withBrackets(Attributes.Template)) : document.querySelectorAll(Attributes.withBrackets(Attributes.Template));

    for (let template of templates) {
        const isLoaded = Boolean(template.getAttribute(Attributes.Loaded));
        // if we have custom values its mob-repeat
        const isTemplateInRepeat = Boolean(template.closest(Attributes.withBrackets(Attributes.Repeat)));
        const shouldRenderTemplateOfRepeat = isTemplateInRepeat && Boolean(customValues);
        const templatePath = template.getAttribute(Attributes.Template);
        const templateDom = await fetchTemplate(templatePath);

        if (shouldRenderTemplateOfRepeat) {
            await handleRepeatItemTemplate({template, templateDom, customValues, contextValues});
        } else {
            if (!isLoaded && !isTemplateInRepeat) {
                await invokeUiBlocks(template, templateDom, contextValues, customValues);
            }
        }
    }
}

const handleRepeatItemTemplate = async ({template, templateDom, customValues, contextValues}) => {
    const itemKeyValue = template.closest(Attributes.withBrackets(Attributes.RepeatItemKey)).getAttribute(Attributes.RepeatItemKey);
    const itemKeyName = template.closest(Attributes.withBrackets(Attributes.Repeat)).getAttribute(Attributes.RepeatKey);
    let currentItem = customValues;
    if (itemKeyName && Array.isArray(customValues)) {
        currentItem = customValues.find(item => item.id == itemKeyValue);
    } else if (Array.isArray(customValues)) {
        currentItem = customValues[parseInt(itemKeyValue)];
    }

    await invokeUiBlocks(template, templateDom, contextValues, currentItem);
};

const invokeUiBlocks = async (template, templateDom, contextValues, customValues) => {
    const html = new DOMParser().parseFromString(templateDom , 'text/html');
    template.appendChild(html.body.firstChild);

    const templateParams = getTemplateParams({
        template,
        valuesToExtract: customValues ? {item: customValues} : contextValues
    });

    const uiBlocks = document.querySelectorAll(Attributes.withBrackets(Attributes.Block));

    for (const blockElem of uiBlocks) {
        const blockName = blockElem.getAttribute(Attributes.Block);

        if (blockElem.getAttribute(Attributes.Ready) !== 'true') {
            const blockId = `${blockName}-${generateId()}`;
            blockElem.setAttribute(Attributes.RepeatBlockId, blockId)
            await mobContext.uiBlocks[blockName].invoke({blockId, injectedParams: templateParams});
            template.setAttribute(Attributes.Loaded, true);
        }
    }
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
                reject('Failed to get template !', templatePath);
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


const getTemplateParams = ({template, valuesToExtract}) => {
    const templateParams = {};

    for (const attr of template.attributes) {
        if (attr.name.includes(Attributes.Param)) {
            const valueToInsert = extractVariableFromDottedString(attr.value, valuesToExtract)
            templateParams[attr.name.replace(Attributes.Param + '-', '')] = valueToInsert;
        }
    }

    return templateParams;
}
