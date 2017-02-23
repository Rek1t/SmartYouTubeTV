///// Helpers //////

function waitBeforeInit(fn) {
    var progress = document.querySelector('#progress-bar');
    var onfocus = function(){fn(); progress.removeEventListener('focus', onfocus)}
    progress.addEventListener('focus', onfocus);
}

var observeDOM = (function(){
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
        eventListenerSupported = window.addEventListener;

    return function(obj, callback){
        if( MutationObserver ){
            // define a new observer
            var obs = new MutationObserver(function(mutations, observer){
                if( mutations[0].addedNodes.length || mutations[0].removedNodes.length )
                    callback(obj);
            });
            // have the observer observe foo for changes in children
            obs.observe( obj, { childList:true, subtree:true });
        }
        else if( eventListenerSupported ){
            obj.addEventListener('DOMNodeInserted', callback, false);
            obj.addEventListener('DOMNodeRemoved', callback, false);
        }
    }
})();

function createElement(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.firstChild;
}

function addClass(el, className) {
    if (el.classList)
      el.classList.add(className);
    else
      el.className += ' ' + className;
}

function removeClass(el, className) {
    if (el.classList)
      el.classList.remove(className);
    else
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

function hasClass( elem, klass ) {
     return (" " + elem.className + " " ).indexOf( " "+klass+" " ) > -1;
}

//Where el is the DOM element you'd like to test for visibility
function isHidden(el) {
    return (el.offsetParent === null)
}

function addEventListenerAll(type, fn, objArr) {
    for (var i = 0; i < objArr.length; i++) {
        objArr[i].addEventListener(type, fn);
    }
}

function removeEventListenerAll(type, fn, objArr) {
    for (var i = 0; i < objArr.length; i++) {
        objArr[i].removeEventListener(type, fn);
    }
}

function append(parent, elem) {
    parent.appendChild(elem);
}

function querySelector(selector) {
    return document.querySelector(selector);
}

function querySelectorAll(selector) {
    return document.querySelectorAll(selector);
}

function remove(el) {
    // remove()
    // var el = document.querySelector('#buttons-list');
    el.parentNode.removeChild(el);
}

function prepend(parent, elems) {
    // prepend()
    // var parent = document.querySelector('.controls-row');
    parent.insertBefore(elems, parent.firstChild);
}

function put(key, value) {
    if (!window.globalMap)
        window.globalMap = {};

    window.globalMap[key] = value;
}

function get(key) {
    if (!window.globalMap)
        return null;

    return window.globalMap[key];
}

////// End Helpers //////

function createQualityToggleButton() {
    return createElement(
    '<div id="transport-more-button" class="toggle-button" tabindex="-1"> \
        <span>Quality Options</span> \
    </div>');
}

function createQualityButtonsRow() {
    return createElement(
    '<div id="buttons-list" class=" list" data-enable-sounds="false" tabindex="-1"> \
        <div class="toggle-button" tabindex="-1" data-itag="160,278" style="min-width: 2.3em; width: initial;">144p</div> \
        <div class="toggle-button" tabindex="-1" data-itag="243,134" style="min-width: 2.3em; width: initial;">360p</div> \
        <div class="toggle-button" tabindex="-1" data-itag="247,136" style="min-width: 2.3em; width: initial;">720p</div> \
        <div class="toggle-button" tabindex="-1" data-itag="248,137" style="min-width: 2.3em; width: initial;">1080p</div> \
    </div>');
}

///// Remote Controller Navigation Handling /////

function sortButtons(nodes) {
    // sort buttons based on horizontal position on screen
    function compareByOffset(a, b) {
      if (a.offsetLeft < b.offsetLeft)
        return -1;
      if (a.offsetLeft > b.offsetLeft)
        return 1;
      return 0;
    }


    var objArr = Array.from(nodes);

    return objArr.sort(compareByOffset);
}

function addArrowKeysHandling(container) {
    // classes: 
    // focused - button highlighted
    // selected - button will have next focus
    // disabled - button not active 

    var buttons = container.querySelectorAll('.button, .toggle-button');
    var buttons = sortButtons(buttons); // convert to array and sort

    if (!buttons)
        console.log('Houston we have problems: cant find buttons');

    var listener1 = function (event) {arrowKeysListener(event, buttons)};  
    var listener2 = function (event) {moveOutListener(event, buttons)};  
    container.addEventListener('keydown', listener1);
    container.addEventListener('keydown', listener2);

    // remove event handlers when content is changed 
    observeDOM(container, function(el) {
        // refill buttons
        buttons = container.querySelectorAll('.button, .toggle-button');
        buttons = sortButtons(buttons); // convert to array and sort

        // reattach handlers
        container.removeEventListener('keydown', listener1);
        container.removeEventListener('keydown', listener2);
        container.addEventListener('keydown', listener1);
        container.addEventListener('keydown', listener2);

        console.log('el changed', el);
    })
}

function moveOutListener(event, objArr) {
    var up = 38;
    var down = 40;
    var esc = 27;
    var keyCode = event.keyCode;

    if (keyCode != up && keyCode != down && keyCode != esc) {
        return;
    }

    var focusedAll = event.currentTarget.querySelectorAll('.focused.button, .focused.toggle-button');
    for (var i = 0; i < focusedAll.length; i++) {
        removeFocus(focusedAll[i]);
    }

    hideQualityControls(); 

    var playBtn = event.currentTarget.querySelector('.icon-player-play');
    addFocus(playBtn);
}

function hideQualityControls() {
    // TODO: rewrite

    if (get('buttons-list') == null) {
        return;
    }

    var backedButtons = get('buttons-list');
    put('buttons-list', null);

    var parent = querySelector('.controls-row'); // root container
    remove(parent.querySelector('#buttons-list'));
    prepend(parent, backedButtons);
}

function arrowKeysListener(event, objArr) {
    var left = 37;
    var right = 39;
    var keyCode = event.keyCode;

    if (event.keyCode != left && event.keyCode != right) {
        return;
    }

    // var objArr = Array.from(nodes);

    switch(keyCode) {
        case left:
            var obj = getNextLeftFocus(objArr, event.target);
            if (obj)
                swapFocus(event.target, obj);
            break;
        case right:
            var obj = getNextRightFocus(objArr, event.target);
            if (obj)
                swapFocus(event.target, obj);
            break;
    } 

    event.stopPropagation(); // I will handle this event 
}

function getNextLeftFocus(objArr, currentFocus) {
    var currIdx = objArr.indexOf(currentFocus);
    if (currIdx == 0)
        return null;

    var prevObj = objArr[currIdx - 1];

    if (hasClass(prevObj, 'disabled'))
        prevObj = objArr[currIdx - 2];

    if (!prevObj)
        return null;

    return prevObj;
}

function getNextRightFocus(objArr, currentFocus) {
    var currIdx = objArr.indexOf(currentFocus);
    if (currIdx == (objArr.length - 1))
        return null;

    var nextObj = objArr[currIdx + 1];

    if (hasClass(nextObj, 'disabled'))
        nextObj = objArr[currIdx + 2];

    if (!nextObj)
        return null;

    return nextObj;    
}

function addFocus(elem) {
    addClass(elem, 'focused');
    addClass(elem, 'selected');  
    elem.focus();
}


function removeFocus(elem) {
    removeClass(elem, 'focused');
    removeClass(elem, 'selected');    
}

function swapFocus(oldFocus, newFocus) {
    removeFocus(oldFocus);
    
    addFocus(newFocus);

    if (isHidden(newFocus)) {
        console.log("Houston we have probles here!"); 
    }
}

///// End Remote Controller Navigation Handling /////

///// Event Handlers /////

function qualityButtonRowOnClick(event) {
    if (event.keyCode != 13) // enter/click
        return;
    
    console.log(event.target.dataset.itag);

    if (window.app)
        window.app.switchResolution(event.target.dataset.itag);
    
    event.stopPropagation(); 
}

function qualityToggleButtonOnClick(event, qualityButtonRow) {
    if (event.keyCode != 13) // enter or click
        return;

    if (get('buttons-list')) {
        var elems = get('buttons-list');
        put('buttons-list', null);
    } else {
        var buttonList = querySelector('#buttons-list');
        put('buttons-list', buttonList);
        var elems = qualityButtonRow;
    }
    
    var buttons = querySelector('#buttons-list');
    remove(buttons);

    var parent = querySelector('.controls-row'); // root container
    prepend(parent, elems);

    // I'll handle event themself
    event.stopPropagation();
}

///// End Event Handlers /////

function notifyAboutSupportedVideoFormats(formats) {
    console.log("Supported formats are: ", formats);
}

function addQualityControls() {
    if (window.addQualityControlsDone)
        return;

    // create and add my toggle-button
    var qualityToggleButton = createQualityToggleButton();
    var parentContainer = querySelector('.controls-row');
    append(parentContainer, qualityToggleButton);
    
    // attach event handler to my toggle-button
    var qualityButtonsRow = createQualityButtonsRow();
    qualityToggleButton.addEventListener('keyup', function(event){qualityToggleButtonOnClick(event, qualityButtonsRow)});

    // attach event handler to quality-button-row
    qualityButtonsRow.addEventListener('keyup', function(event){qualityButtonRowOnClick(event)});

    // add arrow keys handling
    // TODO: not done
    addArrowKeysHandling(querySelector('.controls-row'));

    window.addQualityControlsDone = true;
}

///////////////////////////////////////////////////

// addQualityControls();

// add quality settings to video
waitBeforeInit(addQualityControls);