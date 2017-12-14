/** 
Example showing how transforming all JS expressions (attribute value, node children) in arrow
functions can enable code that remebers locations where expressions evaluation should be placed
and updates only those specific locations over and over again without "rendering" the whole fragment.

ES6 syntax is used, so check ES6 destructuring and arrow functions to more clearly understand the code.
To test the code in older browser change .babelrc and add '"presets": ["es2015"],'

*/



/* ********************************* CODE USING UTILITY AND JSX  ***************************** */

var state = { time : new Date() };

function calcStyle(){
    var colors = ['green','orange','red', 'purple', 'blue']
    return 'color:'+colors[state.time.getSeconds() % colors.length]
}

function num2(n){ return n>9 ? n: '0'+n;}

var def = <div>
    Time: 
    <b style={calcStyle()}>
    {num2(state.time.getHours())}:{num2(state.time.getMinutes())}:{num2(state.time.getSeconds())}
    </b>
</div>

var updaters = applyHtml('app1', def);

function refresh(){
    state.time = new Date();
    updaters.forEach(u=>u());
}

refresh();
setInterval(refresh, 1000);






/* ************************ UTILITY ******************************* */

/** 
Simply creates the object that describes the the html element
that will later be created from it. 
*/
function h(tag,attr, ...children){
  return {tag, attr, children};
}


/** insert HMTL based on tag description and return lsit of callbacks that will refresh each dynamic part */
function insertHtml(parent, before, def, updaters){
    function updateAttr(node, attr, func){
        return function(){
            var newValue = func();
            if(node.getAttribute(attr) != newValue) node.setAttribute(attr, newValue);        
        }
    }

    function updateText(node, func){
        return function(){
            var newValue = func();
            if(node.textContent != newValue) node.textContent = newValue;
        }
    }

    if (typeof def == 'string') {
        var n = document.createTextNode(def);
        parent.insertBefore(n, before);

    } else if(def && def instanceof Function){
        var n = document.createTextNode('');
        parent.insertBefore(n, before);
        // prepare text updater
        updaters.push(updateText(n,def));

    } else if(def instanceof Array){
        def.forEach(function (c) { insertHtml(parent, null, c, updaters);} );

    } else {
        var n = document.createElement(def.tag);
        if (def.attr) {
            for (var a in def.attr) {
                var value = def.attr[a];
                if(value && (value instanceof Function)){
                    // preapre updater for attribute value
                    updaters.push(updateAttr(n, a, value));
                }else{
                    n.setAttribute(a, value);
                }
            }
        }
        parent.insertBefore(n, before);
        if (def.children && def.children.length) {
            insertHtml(n, null, def.children, updaters);
        }
    }
}

/** To simplify, we just clear the element and add new nodes (no vnode diff is performed) */
function applyHtml(parent, def){
    console.log(parent);
    if(typeof parent == 'string') parent = document.getElementById(parent);
    console.log(parent);
    parent.innerHTML = ''; // reset
	var updaters = [];
    insertHtml(parent, null, def, updaters);
    return updaters;
}
