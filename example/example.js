/** 
Intentionally dense example to show some nice usage of even a simple JSX transform. 
If you create your own transformer by adding more features to it, it will make 
the usage more powerfull (and more complicated :) ) 

ES6 syntax is used, so check ES6 destructuring and lambdas to more clearly understand the code.
To test the code in older browser change .babelrc and add '"presets": ["es2015"],'

*/


/* ************************ UTILITY ******************************* */

/** 
Simply creates the object that describes the the html element
that will later be created from it. This is also place where you can add your own customizations
by making conventions for usage interpreting them them here.
*/
function h(tag,attr, ...children){
  return {tag, attr, children};
}

/** insert HMTL based on tag description */
function insertHtml(parent, before, def){
    if (typeof def == 'string') {
        parent.insertBefore(document.createTextNode(def), before);
    } else if(def instanceof Array){
        def.forEach(function (c) { insertHtml(parent, null, c);} );
    } else {
        var n = document.createElement(def.tag);
        if (def.attr) {
            for (var a in def.attr) {
                n.setAttribute(a, def.attr[a]);
            }
        }
        parent.insertBefore(n, before);
        if (def.children && def.children.length) {
            insertHtml(n, null, def.children);
        }
    }
}

/** To simplify, we just clear the element and add new nodes (no vnode diff is performed) */
function applyHtml(parent, def){
    if(typeof parent == 'string') parent = document.getElementById(parent);
    parent.innerHTML = ''; // reset
    insertHtml(parent, null, def);
}



/* ********************************* CODE USING UTILITY AND JSX  ***************************** */


/** our example function that renders based on data (like state in Vue). */
function renderList({data, numbered, color= 'red'}){
    // Uppercase variable name is needed so it is recognized in jsx transformation
    // instead of sending tag name: 'ListType' to the `h` function, the ListType identifier will be sent
    // look at generated code after babel transforms JSX
    var ListType = numbered ? 'ol':'ul';

    var style = 'color:'+color;

    // Array.prototype.map is used because, this way, there is no need to 
    // prepare a variable with array before this JSX fragment.
    return <ListType style={style}>
        { data.map( (item, i)=> <li key={i}>{item}</li> ) }
    </ListType>
}

// initial list
var data = ['first', 'second', 'third'];

// call our renderList function and use applyHtml to display result with different state
applyHtml('app1', renderList({data, numbered:true } ));
applyHtml('app2', renderList({data, numbered:false} ));

applyHtml('app3', renderList({
    data:data.concat(['fourth', 'fifth']), 
    numbered:true, 
    color:'blue'} 
));

