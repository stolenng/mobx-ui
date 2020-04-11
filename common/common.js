export const eventList = [
    "copy",
    "cut",
    "paste",
    "abort",
    "blur",
    "cancel",
    "canplay",
    "canplaythrough",
    "change",
    "click",
    "close",
    "contextmenu",
    "cuechange",
    "dblclick",
    "drag",
    "dragend",
    "dragenter",
    "dragleave",
    "dragover",
    "dragstart",
    "drop",
    "durationchange",
    "emptied",
    "ended",
    "error",
    "focus",
    "formdata",
    "input",
    "invalid",
    "keydown",
    "keypress",
    "keyup",
    "load",
    "loadeddata",
    "loadedmetadata",
    "loadstart",
    "mousedown",
    "mouseenter",
    "mouseleave",
    "mousemove",
    "mouseout",
    "mouseover",
    "mouseup",
    "mousewheel",
    "pause",
    "play",
    "playing",
    "progress",
    "ratechange",
    "reset",
    "resize",
    "scroll",
    "seeked",
    "seeking",
    "select",
    "stalled",
    "submit",
    "suspend",
    "timeupdate",
    "toggle",
    "volumechange",
    "waiting",
    "wheel",
    "auxclick",
    "gotpointercapture",
    "lostpointercapture",
    "pointerdown",
    "pointermove",
    "pointerup",
    "pointercancel",
    "pointerover",
    "pointerout",
    "pointerenter",
    "pointerleave",
    "selectstart",
    "selectionchange",
    "animationend",
    "animationiteration",
    "animationstart",
    "transitionend",
    "pointerrawupdate"
];

export const bindingRegex = new RegExp('{(.*?)}');
export const functionParamsRegex = new RegExp('\\((.*?)\\)');
export const libraryPrefix = `mob`;

export const getLibraryEventName = (eventName) => `${libraryPrefix}-${eventName}`;

export const Attributes = {
  Template: `${libraryPrefix}-template`,
  Loaded: `${libraryPrefix}-loaded`,
  Block: `${libraryPrefix}-block`,
  Ready: `${libraryPrefix}-ready`,
  RepeatItem: `${libraryPrefix}-repeat-item`,
  RepeatItemKey: `${libraryPrefix}-repeat-item-key`,
  RepeatBlock: `${libraryPrefix}-repeat-block`,
  withBrackets: (attrName) => `[${attrName}]`
};
