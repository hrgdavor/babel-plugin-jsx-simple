# babel-plugin-jsx-simple [![CircleCI](https://img.shields.io/circleci/project/hrgdavor/babel-plugin-jsx-simple.svg?maxAge=2592004)](https://circleci.com/gh/hrgdavor/babel-plugin-jsx-simple)

> Babel plugin for simple JSX to JS transformation.

Meant as basis for anyone looking to:
 - understand or demistify JSX
 - see what JSX is all about in it's most basic form
 - use JSX in own code with zero deps (needing this plugin in translipation step of course).
 - create new library that uses JSX (adding your own specific rules and extra transformations)

Based on [babel-plugin-transform-vue-jsx](https://github.com/vuejs/babel-plugin-transform-vue-jsx) by 
simplifying it, and removing all but basic JSX transformation.

[ES6](https://babeljs.io/learn-es2015) syntax is used intentionally because current browsers are already ok with ES6 code 
(at the time of creation of this plugin: Edge, Chrome, FF). Additionally, tools like `babel` enable a simple
bridge for all cases where older ES is needed. Babel easily will transpile the code for older browsers if you use preset `es2015`.

### What is JSX all about(the basic idea)

You want to write code that combines HTML and JS and do it sometimes inside a JS file too.

``` js
var person = {name:'Somebody', city: 'Mordor'}

var def = <div>
  <div class="name"><b>Name: </b>{person.name}</div>
  <div class="city"><b>City: </b>{person.city}</div>
</div>

applyHtml(document.getElementById('person-data'), def);
```

The JSX is tranformed to function calls and then the code looks like this

``` js
var person = {name:'Somebody', city: 'Mordor'}

var def = h('div', null,
  h('div', {'class':'name'}, h('b', null, 'Name: '), person.name),
  h('div', {'class':'city'}, h('b', null, 'City: '), person.city),
)

applyHtml(document.getElementById('person-data'), def);
```

the function `h` is implemented in such way that these calls to `h` result in `def` being: 

```js
{
  "tag": "div",
  "attr": null,
  "children": [
    {
      "tag": "div",
      "attr": { "class": "name" },
      "children": [
        { "tag": "b", "attr": null,  "children": [ "Name: " ] },
        "Somebody"
      ]
    },
    {
      "tag": "div",
      "attr": { "class": "city" },
      "children": [
        { "tag": "b", "attr": null,  "children": [ "City: " ] },
        "Mordor"
      ]
    }
  ]
}
```

the `applyHtml` function is implemented to generate HTML based on data structured like that
so the final result in HTML is:

```html
<div>
  <div class="name"><b>Name: </b>Somebody</div>
  <div class="city"><b>City: </b>Mordor</div>
</div>
```

### Example code

First exmaple in [example/example.js](example/example.js) is written on this principle, and is principally very similar
to rendering in Vue and React (to simplify the code no diff is done, instead simple clear + add is used). You can find sample implementation of `applyHtml` and `h` there.

Second exmaple in [example-arrow/example.js](example-arrow/example.js) showcases how wrapping dynamic parts
into arrow functions can enable dynamic changes (but with static structure) that uses JSX but with principles
closer to templating approach (You create mostly static structure, where dynamic parts have special handling
so they can be updated when needed).

These two approaches can be combined in more fine grained manner than just global flag to achieve interesting things.

### Requirements

- This is mutually exclusive with `babel-plugin-transform-react-jsx` and `babel-plugin-transform-vue-jsx`.

### AST explorer

There is a very nice way to play with AST using [AST explorer](http://astexplorer.net). And you can
play with this plugin and JSX on [this snippet](http://astexplorer.net/#/gist/4e5fd118496167a9fccd7347cce4b5fa/09dee46e34654dff308a70135f6be46b86eeadc2).
The code from `index.js` is pasted there but one line is commented out: `//inherits: require('babel-plugin-syntax-jsx'),`.

Ast explorer is an excellent way to inspect AST produced from original code, and test how different code (with JSX)
is transformed into pure JS. This way you get a better picture of what can be done with JSX and understand the connection
between what you type in the original file and what the browser will see. 

You will also see from there how a plugin can transform AST to give such nice features like JSX->JS in a reliable way.

### Usage

Create an empty folder with empty `package.json` 
```
{}
```

``` bash
npm install babel-plugin-syntax-jsx babel-plugin-jsx-simple babel-preset-env --save-dev
```

create `.babelrc`:

``` json
{
  "presets": ["env"],
  "plugins": ["jsx-simple"]
}
```

 - Make a file `test.js`
 - put some of example code from below in it 
 - run `babel test.js`

The plugin transpiles the following JSX:

``` js
<div id="foo">{text}</div>
```

To the following JavaScript:

``` js
h('div', {
  id: 'foo'
}, text)
```

Note the `h` function, which is something that you need to provide in the scope. A simple function 
like this can be sufficient for many use cases:

```js
  function h(tag, attr, ...children){
    return {tag, attr, children };
  }
```

### Difference from JSX in React and Vuejs

React and Vue add extra transformations that allows usefull shortcuts for their own use-cases.

This plugin takes a basic principle of converting tags to function calls that can be easily converted
to html nodes later. Child nodes are sent as extra parameters to he called function.

the function that will be called is `h` and it your responsibility to have it visible in the scope where JSX is used.

There is one simple extra transform that is done in this plugin:
 - tag names that start with uppercase are passed as identifier instead as string literal.

### Tag Name Tip

If a tag name starts with lowercase, it will be treated as a string . 
If it starts with uppercase, it will be treated as an identifier, which allows you to do:

``` js
export default {
  render (h, state) {
    const Todo = state.numbered ? 'ol':'ul'
    return <Todo> 
      <li> first </li>
      <li> second </li>
    </Todo> 
  }
}
```

The transformed code  will be:

``` js
export default {
  render (h, state) {
    const Todo = state.numbered ? 'ol':'ul'
    return h(Todo, null,
      h('li', null, 'first'),
      h('li', null, 'second')
    ) 
  }
}
```

### JSX Spread

JSX spread is simply translated to javascript spread.

``` js
const data = {
  href: 'b',
  id: 'id1'
}
const vnode = <div class="a" {...data}/>
```

The transformed code  will be:

``` js
const data = {
  href: 'b',
  id: 'id1'
}
const vnode = h('div', {class: 'a', ...data })
```


