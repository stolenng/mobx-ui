import {bindingRegex, functionParamsRegex} from "./common";

export const extractVariableFromDottedString = (varName, items) => {
    const split = varName.split('.');

    let item = items[split[0]];
    const query = split.splice(1);

    query.forEach(entry => {
        item = item[entry.toString()];
    });

    return item
};

export const checkIfParamsInStringFunctionString = (functionString, contextValues, paramExtractor) => {
    const variablesList = getVariablesListFromText(
        functionString,
        functionParamsRegex,
        (results) => results.length ? results[0].split(',') : []
    );

    const hasParams = variablesList.length > 0;
    const params = [];

    variablesList.forEach(varName => {
        const foundValue = paramExtractor ? paramExtractor(contextValues) : extractVariableFromDottedString(varName, contextValues);
        params.push(foundValue);
    });

    return {
        params,
        hasParams
    }
}

export const getFunctionNameFromString = (functionString) => functionString.split('(')[0];

export const getVariableInCurlyBracelets = (valueString, items) => {
    const stater = valueString.split('.')[0];
    const query = valueString.split('.').splice(1);
    let itemToShow = items[valueString] ? items[valueString] : items[stater];
    query.forEach(entry => {
        itemToShow = itemToShow[entry.toString()];
    });

    return itemToShow;
}

export const getVariablesListFromText = (text, customRegex, customTransformer) => {
    const currentRegex = customRegex ? customRegex : bindingRegex;
    text = text.replace(/\s+/g, ''); // spaces
    const results = [];
    let match = currentRegex.exec(text);

    while (match) {
        results.push(match[1]);
        text = text.substr(match.index + match[0].length);
        match = currentRegex.exec(text)
    }

    return customTransformer ? customTransformer(results) : results;
};

export const getInjectedValuesInText = (text, item) => {
    const results = getVariablesListFromText(text);

    if (!results) {
        return text;
    }

    results.forEach(result => {
        const itemToShow = extractVariableFromDottedString(result, {item});

        text = text.replace(`{${result}}`, `${JSON.stringify(itemToShow)}`);
    })

    return text;
};


export const getInjectedText = (text, items) => {
    const results = getVariablesListFromText(text);

    results.forEach(result => {
        const itemToShow = getVariableInCurlyBracelets(result, items);

        text = text.replace(`{${result}}`, itemToShow);
    });

    const initialValuablesName = results.map(result => result.split('.')[0]);

    return {
        variableNames: initialValuablesName,
        text: text
    }
}


export const getPropertyNameByInputType = (inputType) => {
    switch (inputType) {
        case 'checkbox':
            return 'checked'
        default:
            return 'value';
    }
}

export const eventDisposer = ({observersToDispose, elemEvents}) => {
    return () => {
        console.log(`removed ${observersToDispose.length} mobx observers, and ${elemEvents.length} dom event hanlders`)
        observersToDispose.forEach(dispose => dispose());

        console.log('filtering disposer empty arrasys for now!', elemEvents.length)
        elemEvents = elemEvents.filter(elemEvent => !Array.isArray(elemEvent));
        console.log('filtering disposer empty arrasy for now!', elemEvents.length)

        elemEvents.forEach(elemEvent => {
            elemEvent.elem.removeEventListener(elemEvent.eventType, elemEvent.fn)
        });
    };
};

export const updateElementAttributesByItem = ({domElement, item}) => {
    const attrKeys = Object.keys(domElement.attributes);
    attrKeys.forEach(attrKey => domElement.attributes[attrKey].value = getInjectedValuesInText(domElement.attributes[attrKey].value, item));
};
