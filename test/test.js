import { expect } from 'chai'

describe('babel-plugin-jsx-simple', () => {
  it('should contain text', () => {
    const vnode = render(h => <div>test</div>)
    expect(vnode.tag).to.equal('div')
    expect(vnode.children[0]).to.equal('test')
  })

  it('should spread attribs', () => {
    const sth = {name:'Joe'};
    const vnode = render(h => <div {...sth}>test</div>)
    expect(vnode.tag).to.equal('div')
    expect(vnode.children[0]).to.equal('test')
    expect(vnode.attr.name).to.equal('Joe')
  })

  it('should spread and combine attribs', () => {
    const v1 = {name:'Joe1', city:'Mordor'};
    const href= '#';
    const v2 = {name:'Joe2'};

    const vnode = render(h => <div {...v1} href={href} id="myId" {...v2}></div>)

    expect(vnode.tag).to.equal('div')
    expect(vnode.attr.name).to.equal('Joe2')
    expect(vnode.attr.href).to.equal('#')
    expect(vnode.attr.id).to.equal('myId')
    expect(vnode.attr.city).to.equal('Mordor')
  })

  function render(callback){
    return callback(createElement);
  }

  function createElement(tag,attr){
    return {tag, attr, children: Array.prototype.slice.call(arguments,2) };
  }

})

