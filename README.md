# babel-plugin-jsx-simple [![CircleCI](https://img.shields.io/circleci/project/hrgdavor/babel-plugin-jsx-simple.svg?maxAge=2592004)](https://circleci.com/gh/hrgdavor/babel-plugin-jsx-simple)

> Babel plugin for simple JSX to JS transformation.

Meant as basis for anyone looking to:
 - understand and see what JSX is all about in it's most basic form
 - use JSX in own code with zero deps (needing this plugin in translipation step of course).
 - create own library that uses JSX addin own specific rules and extra transformations

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

``` bash
npm install\
  babel-plugin-syntax-jsx\
  babel-plugin-jsx-simple\
  babel-preset-env\
  --save-dev
```

In your `.babelrc`:

``` json
{
  "presets": ["env"],
  "plugins": ["jsx-simple"]
}
```

The plugin transpiles the following JSX:

``` js
<div id="foo">{this.text}</div>
```

To the following JavaScript:

``` js
h('div', {
  id: 'foo'
}, this.text)
```

Note the `h` function, which is something that you need to provide in the scope

### Difference from React and Vue JSX

This plugin only transforms tag names that start with uppercase from string literal to identifier, and does no other transformation.
Child nodes are sent as extra parameters calling function `h(tagName, attr, child1, child2, ...)`.

### Custom Tag Tip

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

JSX spread is simply translated to javascript spread. At the time of creation of this plugin,
new browser versions are already adopting ES6, so no effort is made here to transpile spread.
You can use let babel to transpile the code for older browsers by using preset `es2015`.

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
