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

export const attributesList = [
    "accept",
    "accept-charset",
    "accesskey",
    "action",
    "align",
    "allow",
    "alt",
    "async",
    "autocapitalize",
    "autocomplete",
    "autofocus",
    "autoplay",
    "buffered",
    "capture",
    "charset",
    "checked",
    "cite",
    "class",
    "code",
    "codebase",
    "cols",
    "colspan",
    "content",
    "contenteditable",
    "contextmenu",
    "controls",
    "coords",
    "crossorigin",
    "csp",
    "data",
    "datetime",
    "decoding",
    "default",
    "defer",
    "dir",
    "dirname",
    "disabled",
    "download",
    "draggable",
    "dropzone",
    "enctype",
    "enterkeyhint",
    "for",
    "form",
    "formaction",
    "formenctype",
    "formmethod",
    "formnovalidate",
    "formtarget",
    "headers",
    "hidden",
    "high",
    "href",
    "hreflang",
    "http-equiv",
    "icon",
    "id",
    "importance",
    "integrity",
    "itemprop",
    "kind",
    "label",
    "lang",
    "language",
    "list",
    "loop",
    "low",
    "max",
    "maxlength",
    "minlength",
    "media",
    "min",
    "multiple",
    "muted",
    "name",
    "novalidate",
    "open",
    "optimum",
    "pattern",
    "ping",
    "placeholder",
    "poster",
    "preload",
    "readonly",
    "referrerpolicy",
    "rel",
    "required",
    "reversed",
    "rows",
    "rowspan",
    "sandbox",
    "scope",
    "scoped",
    "selected",
    "shape",
    "size",
    "sizes",
    "slot",
    "span",
    "spellcheck",
    "src",
    "srcdoc",
    "srclang",
    "srcset",
    "start",
    "step",
    "style",
    "summary",
    "tabindex",
    "target",
    "title",
    "translate",
    "Text",
    "type",
    "usemap",
    "value",
    "width",
    "wrap"
];

export const bindingRegex = new RegExp('{(.*?)}');
export const functionParamsRegex = new RegExp('\\((.*)\\)');
export const libraryPrefix = `mob`;

export const getLibraryEventName = (eventName) => `${libraryPrefix}-on-${eventName}`;
export const getLibraryAttributeName = (eventName) => `${libraryPrefix}-${eventName}`;

export const Attributes = {
    Template: `${libraryPrefix}-template`,
    Loaded: `${libraryPrefix}-loaded`,
    Block: `${libraryPrefix}-block`,
    Bind: `${libraryPrefix}-bind`,
    Ready: `${libraryPrefix}-ready`,
    Repeat: `${libraryPrefix}-repeat`,
    RepeatKey: `${libraryPrefix}-repeat-key`,
    RepeatItem: `${libraryPrefix}-repeat-item`,
    RepeatItemKey: `${libraryPrefix}-repeat-item-key`,
    RepeatBlockId: `${libraryPrefix}-repeat-block-id`,
    InitialValue: `${libraryPrefix}-init-value`,
    Param: `${libraryPrefix}-param`,
    withBrackets: (attrName) => `[${attrName}]`,
    withBracketsValue: (attrName, attrValue) => `[${attrName}="${attrValue}"]`
};
