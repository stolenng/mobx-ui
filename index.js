import './examples/main-page';
import {createUiBlock} from './core/ui-block';
import {initUiBlocks} from './core/templates';

/* Pieces ToDO:
- repeat $index
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
