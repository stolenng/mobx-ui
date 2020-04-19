import './examples/main-page';
import {createUiBlock} from './core/ui-block';
import {initUiBlocks} from './core/templates';

/* Pieces ToDO:
- refactor ->  getInjectedValuesInText + getInjectedText -> make 1 mechanisem to extract from text
- fix global scope + current item scope passing or agree that if u want global scope just use function because u have access from there !
- bugs with ng repeat update
- function to single bindings + attrs +ng repeat
- attributes binding
- DISPOSE WHEN ELEMENT DIES - MUTATION OBSERVER WHEN DEAD REMOVE ALL WATCHERS
- duplicate kyes in repeat alert
- coronavirus dashboard
- life cycle - after render ?
- life cycle - before RIP(dea)
* */

initUiBlocks();

//TODO: MOB-IF || MOB - SHOW || MOB-TEMPLATE || LIFECYCLE ?? || ERRORS || SETUP PROJECT ||


export {
    initUiBlocks,
    createUiBlock
}
