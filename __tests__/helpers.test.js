import {
    getValueFromTextParam,
    getParamNamesFromFunction,
    getParamValuesFromFunctionText,
    getValueFromFunctionText
} from "../common/helpers";

describe('helpers', () => {
    describe('text extraction', () => {
        describe('getValueFromTextParam', function () {
            it('should return value from string with few dots', () => {
                const item = {
                    id: {
                        id: 5
                    }
                };
                const result = getValueFromTextParam({paramText: 'item.id.id', items: {item}});

                expect(result).toEqual(5);
            });

            it('should return value from string one dot', () => {
                const item = {
                    id: 5
                };
                const result = getValueFromTextParam({paramText: 'item.id', items: {item}});

                expect(result).toEqual(5);
            });
        });

        describe('getParamNamesFromFunction', () => {
            it('should return params in function', () => {
                const result = getParamNamesFromFunction({funcText: 'getText(uno, dos, tres)'});
                expect(result).toEqual(['uno', 'dos', 'tres']);
            })

            it('should return no params if function without any', () => {
                const result = getParamNamesFromFunction({funcText: ')'});
                expect(result).toEqual([]);
            })
        });


        describe('getParamValuesFromFunctionText', () => {
            it('should extract param values from function text', () => {
                const funcText = `getText(uno, dos, tres)`;
                const items = {
                    uno: 1,
                    dos: 2,
                    tres: 3
                };
                const result = getParamValuesFromFunctionText({funcText, items});
                expect(result).toEqual([1, 2, 3])
            });

            it('should extract param values with custom extractor', () => {
                const funcText = `getText(uno, dos, tres)`;
                const items = {
                    uno: 1,
                    dos: 2,
                    tres: 3
                };
                const funcParamExtractor = ({paramText, items}) => items[paramText] * 10;
                const result = getParamValuesFromFunctionText({funcText, items, funcParamExtractor});
                expect(result).toEqual([10, 20, 30])
            });
        });

        describe('getValueFromFunctionText', () => {
            it('should return values from function text with params', () => {
                const funcText = `getText(uno, dos, tres)`;
                const items = {
                    uno: 1,
                    dos: 2,
                    tres: 3,
                    getText: (a, b, c,) => a + b + c
                }
                const result = getValueFromFunctionText({funcText, items});
                expect(result).toEqual(6);
            });

            it('should return values from function text without params', () => {
                const fakeText = 'Hate extracting stuff from strings';
                const funcText = `getText()`;
                const items = {
                    getText: () => fakeText
                }
                const result = getValueFromFunctionText({funcText, items});
                expect(result).toEqual(fakeText);
            });
        });
    })
});
