import {defineUiBlock} from "../../core/ui-block";
import {observable} from "mobx";

defineUiBlock('params-page', (injectedParams) => {
   console.log(injectedParams);

   const test = observable.box('OMFG');

   return {
       test
   }
});
