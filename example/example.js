
function render (h) {
  const data = {
    id: 'hehe',
    onclick: () => {
      console.log('click')
    }
  }
  return <div href="hoho" {...data} ></div>
}

function createElement(tag,attr){
  return {tag, attr, children: Array.prototype.slice.call(arguments,2) };
}

console.log(render(createElement));
