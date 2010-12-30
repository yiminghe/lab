var KISSY={
    augment:function(){},
    merge:function(){},
    extend:function(){},
    namespace:function(){},
    guid:function(){},
    one:function(){},
    all:function(){},
    log:function(){},
    error:function(){},
    mix:function(){},
    use:function(){},
    add:function(){},
    app:function(){},
    isEmptyObject:function(){},
    isFunction:function(){},
    isString:function(){},
    isUndefined:function(){},
    isNumber:function(){},
    isPlainObject:function(){},
    isArray:function(){},
    trim:function(){},
    substitute:function(){},
    each:function(){},
    indexOf:function(){},
    lastIndexOf:function(){},
    unique:function(){},
    inArray:function(){},
    makeArray:function(){},
    filter:function(){},
    param:function(){},
    unparam:function(){},
    later:function(){},
    clone:function(){},
    globalEval:function(){},
    getScript:function(){},
    ready:function(){}        
};
/**
*@constructor
*/
KISSY.EventTarget=function(){};

KISSY.EventTarget.prototype={
    fire:function(){},
    on:function(){},
    detach:function(){}
};

/**
*@constructor
*/
KISSY.Node=function(){};

KISSY.Node.prototype={
    length:1,
    append:function(){},
    appendTo:function(){},
    prepend:function(){},
    prependTo:function(){},
    hasClass:function(){},
    replaceClass:function(){},
    toggleClass:function(){},
    val:function(){},
    text:function(){},
    css:function(){},
    width:function(){},
    height:function(){},
    show:function(){},
    hide:function(){},
    toggle:function(){},
    addStyleSheet:function(){},
    offset:function(){},
    scrollLeft:function(){},
    scrollRight:function(){},
    docWidth:function(){},
    docHeight:function(){},
    siblings:function(){},
    children:function(){},
    create:function(){},
    html:function(){},
    insertBefore:function(){},
    insertAfter:function(){},
    attr:function(){},
    removeAttr:function(){},
    scrollIntoView:function(){},    
    parent:function(){},
    next:function(){},
    contains:function(){},
    prev:function(){},   
    addClass:function(){},
    removeClass:function(){},
    on:function(){},
    data:function(){},
    removeData:function(){},
    detach:function(){}
};

KISSY.UA={
    ie:1,
    gecko:1,
    trident:1,
    presto:1,
    chrome:1,
    safari:1,
    firefox:1,
    opera:1,
    mobile:1,   
    webkit:1
};

KISSY.DOM={
    append:function(){},
    prepend:function(){},
    hasClass:function(){},
    replaceClass:function(){},
    toggleClass:function(){},
    val:function(){},
    text:function(){},
    css:function(){},
    width:function(){},
    height:function(){},
    show:function(){},
    hide:function(){},
    toggle:function(){},
    addStyleSheet:function(){},
    offset:function(){},
    scrollLeft:function(){},
    scrollRight:function(){},
    docWidth:function(){},
    docHeight:function(){},
    siblings:function(){},
    children:function(){},
    create:function(){},
    html:function(){},
    insertBefore:function(){},
    insertAfter:function(){},
    attr:function(){},
    removeAttr:function(){},
    scrollIntoView:function(){},    
    parent:function(){},
    next:function(){},
    contains:function(){},
    prev:function(){},   
    addClass:function(){},
    removeClass:function(){},
    viewportWidth:function(){},
    viewportHeight:function(){}    
};

KISSY.Event={
    add:function(){},
    on:function(){},
    remove:function(){},
    fire:function(){}    
};


/**
*@constructor
*/
KISSY.Attribute=function(){};


KISSY.Attribute.prototype={
    addAttr:function(){},
    addAttrs:function(){},
    hasAttr:function(){},
    removeAttr:function(){},
    set:function(){},
    get:function(){},
    reset:function(){}
};



/**
*@constructor
*/
KISSY.EventObject=function(){}

KISSY.EventObject.prototype={
    halt:function(){},
    preventDefault:function(){},
    stopPropagation:function(){}
};





/**
*@constructor
*/
KISSY.Base=function(){}


/**
*@constructor
*/
KISSY.Editor=function(){}
/**
*@constructor
*/
KISSY.Editor.Range=function(){}


