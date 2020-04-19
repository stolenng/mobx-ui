import {getValueFromTextParam, getParamNamesFromFunction} from "../common/helpers";

describe('helpers', () => {
   describe('text extraction', () => {
       it('should return value from string with few dots', () => {
           const item = {
               id: {
                   id: 5
               }
           };
           const result = getValueFromTextParam({paramName: 'item.id.id', items: {item}});

           expect(result).toEqual(5);
       });

       it('should return value from string one dot', () => {
           const item = {
               id: 5
           };
           const result = getValueFromTextParam({paramName: 'item.id', items: {item}});

           expect(result).toEqual(5);
       });

       it('should return params in function', () => {
           const result = getParamNamesFromFunction({functionString: 'getText(uno, dos, tres)'});
           expect(result).toEqual( ['uno', 'dos', 'tres']);
       })

       it('should return no params if function without any', () => {
           const result = getParamNamesFromFunction({functionString: ')'});
           expect(result).toEqual( []);

       })

   })
});
