
module.exports = function (babel) {
  var t = babel.types

  return {
    inherits: require('babel-plugin-syntax-jsx'),
    visitor: {
      JSXNamespacedName (path) {
        throw path.buildCodeFrameError(
          'Namespaced tags/attributes are not supported. JSX is not XML.\n' +
          'For attributes like xlink:href, use xlinkHref instead.'
        )
      },
      JSXElement: {
        exit (path, file) {
          // turn tag into createElement call
          var callExpr = buildElementCall(path.get('openingElement'), file)
          if (path.node.children.length) {
            // add children array as 3rd+ arg
            path.node.children.forEach(c=>callExpr.arguments.push(c));
            // if you want to create an array instead, do it here            
          }
          path.replaceWith(t.inherits(callExpr, path.node))
        }
      }
    }
  }

  function buildElementCall (path, file) {
    path.parent.children = t.react.buildChildren(path.parent)
    var tagExpr = convertJSXIdentifier(path.node.name, path.node)
    var args = []
    var tagName
    if (t.isIdentifier(tagExpr)) {
      tagName = tagExpr.name
    } else if (t.isLiteral(tagExpr)) {
      tagName = tagExpr.value
    }

    if (t.react.isCompatTag(tagName)) {
      args.push(t.stringLiteral(tagName))
    } else {
      args.push(tagExpr)
    }

    var attribs = path.node.attributes
    if (attribs.length) {
      attribs = buildOpeningElementAttributes(attribs, file)
    } else {
      attribs = t.nullLiteral()
    }
    args.push(attribs)

    return t.callExpression(t.identifier('h'), args)
  }

  function convertJSXIdentifier (node, parent) {
    if (t.isJSXIdentifier(node)) {
      if (node.name === 'this' && t.isReferenced(node, parent)) {
        return t.thisExpression()
      } else{
        // Vue uses esutils here to confirm valid Identifier name
        // we do no such thing for our simple JSX transform
        node.type = 'Identifier'
      }
    } else if (t.isJSXMemberExpression(node)) {
      return t.memberExpression(
        convertJSXIdentifier(node.object, node),
        convertJSXIdentifier(node.property, node)
      )
    }
    return node
  }

  /**
   * Convert to object declaration by adding all 
   * props and spreads as they are found.
   */

  function buildOpeningElementAttributes (attribs) {
    var _props = []

    while (attribs.length) {
      var prop = attribs.shift()
      if (t.isJSXSpreadAttribute(prop)) {
        prop.argument._isSpread = true
        _props.push(t.spreadProperty(prop.argument))
      } else {
        _props.push(convertAttribute(prop))
      }
    }

    attribs = t.objectExpression(_props)
    
    return attribs
  }

  function convertAttribute (node) {
    var value = convertAttributeValue(node.value || t.booleanLiteral(true))
    if (t.isStringLiteral(value) && !t.isJSXExpressionContainer(node.value)) {
      value.value = value.value.replace(/\n\s+/g, ' ')
    }
    if (t.isValidIdentifier(node.name.name)) {
      node.name.type = 'Identifier'
    } else {
      node.name = t.stringLiteral(node.name.name)
    }
    return t.inherits(t.objectProperty(node.name, value), node)
  }

  function convertAttributeValue (node) {
    if (t.isJSXExpressionContainer(node)) {
      return node.expression
    } else {
      return node
    }
  }
}
