import {createUiBlock} from "../../core/ui-block";
import {observable} from "mobx";

createUiBlock('params-page', (injectedParams) => {
   const test = observable.box('OMFG');
   const params = observable(injectedParams);

   return {
       params,
       test
   }
});
