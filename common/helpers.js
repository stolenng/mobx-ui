import {bindingRegex, functionParamsRegex} from "./common";

export const getValueFromTextParam = ({paramText, items}) => {
    const split = paramText.split('.');

    if (split.length === 1) {
        return items[paramText];
    }

    let searchedItem = items[split[0]];

    const query = split.splice(1);

    query.forEach(entry => {
        searchedItem = searchedItem[entry.toString()];
    });

    return searchedItem
};

export const getParamValuesFromFunctionText = ({funcText, items, funcParamExtractor}) => {
    const funcParams = getParamNamesFromFunction({funcText})

    const paramValues = funcParams.map(paramText => {
        return funcParamExtractor ? funcParamExtractor({paramText, items}) : getValueFromTextParam({
            paramText,
            items
        });
    });

    return paramValues;
};

export const getValueFromFunctionText = ({funcText, items, funcParamExtractor}) => {
    const funcName = getFunctionNameFromString(funcText);
    const paramValues = getParamValuesFromFunctionText({funcText, items, funcParamExtractor});

    if (paramValues.length > 0) {
        return items[funcName](...paramValues);
    } else {
        return items[funcName]();
    }
};

export const getParamNamesFromFunction = ({funcText}) => {
    const variablesList = getVariablesListFromText({
        text: funcText,
        customRegex: functionParamsRegex,
        customTransformer: (results) => {
            return results.length ? results[0].split(',') : [];
        }
    }).filter(Boolean);

    return variablesList;
};

export const getParamsFromDomText = ({domText}) => {
    const variablesList = getVariablesListFromText({text: domText});
    return variablesList;
};

// NEW AMAZING TESTED STUFF UP :D
//OLD STUFF DOWN

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
    const variablesList = getVariablesListFromText({
        text: functionString,
        customRegex: functionParamsRegex,
        customTransformer: (results) => results.length ? results[0].split(',') : []
    }).filter(Boolean);

    const hasParams = variablesList.length > 0;
    const params = [];

    variablesList.forEach(varName => {
        const foundValue = paramExtractor ? paramExtractor(contextValues, varName) : extractVariableFromDottedString(varName, contextValues);
        params.push(foundValue);
    });

    return {
        params,
        hasParams
    }
}

export const getFunctionNameFromString = (functionString) => functionString.split('(')[0];

export const getVariableInCurlyBracelets = (valueString, items) => {
    const isFunction = valueString.indexOf('(') !== -1;
    let itemToShow;

    if (!isFunction) {
        const stater = valueString.split('.')[0];
        const query = valueString.split('.').splice(1);
        itemToShow = items[valueString] ? items[valueString] : items[stater];
        query.forEach(entry => {
            itemToShow = itemToShow[entry.toString()];
        });
    } else {
        // handle func
        const funcName = getFunctionNameFromString(valueString);
        const {hasParams, params} = checkIfParamsInStringFunctionString(valueString, items, null);

        if (hasParams) {
            itemToShow = items[funcName](...params);
        } else {
            itemToShow = items[funcName]();
        }
    }

    return itemToShow;
}

export const getVariablesListFromText = ({text, customRegex, customTransformer}) => {
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

export const getInjectedValuesInText = (text, item, customTransformer) => {
    const results = getVariablesListFromText({text});

    if (!results) {
        return text;
    }

    results.forEach(result => {
        let itemToShow;

        if (result.includes('$index')) {
            itemToShow = customTransformer(result);
        } else {
            itemToShow = result.indexOf('.') === -1 ? item[result] : extractVariableFromDottedString(result, {item});
        }

        text = text.replace(`{${result}}`, itemToShow);
    })

    return text;
};

export const getInjectedText = (text, items) => {
    const results = getVariablesListFromText({text});

    results.forEach(result => {
        const itemToShow = getVariableInCurlyBracelets(result, items);

        if (result.indexOf('(') !== -1) {
            result = result.replace(',', ', ');
        }

        text = text.replace(`{${result}}`, itemToShow);
    });

    const fullVariableNames = results.map(result => result.split('.')[0]);
    let functionParams = [];

    for (const result of results) {
        if (result.indexOf('(') !== -1) {
            const splitString = result.split('(');

            splitString.splice(0, 1);

            functionParams.push(
                ...splitString.join().replace(')', '').split(',')
            )
        }
    }

    functionParams = functionParams.filter(Boolean);

    return {
        functionParams,
        variableNames: fullVariableNames,
        originalNames: results,
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
        observersToDispose.forEach(dispose => dispose());

        elemEvents = elemEvents.filter(elemEvent => !Array.isArray(elemEvent));

        elemEvents.forEach(elemEvent => {
            elemEvent.elem.removeEventListener(elemEvent.eventType, elemEvent.fn)
        });
    };
};

export const updateElementAttributesByItem = ({domElement, item}) => {
    const attrKeys = Object.keys(domElement.attributes);
    attrKeys.forEach(attrKey => domElement.attributes[attrKey].value = getInjectedValuesInText(domElement.attributes[attrKey].value, item));
};


export const generateId = () => {
    function chr4() {
        return Math.random().toString(16).slice(-4);
    }

    return chr4() + chr4() +
        '-' + chr4() +
        '-' + chr4() +
        '-' + chr4() +
        '-' + chr4() + chr4() + chr4();
}

export const isFunctionText = (text) => text.includes('(') === true || text.includes(')') === true;
