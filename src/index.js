import createElement from '../source/createElement'
import { render } from '../source/render'

//vnode
/**
 *  tag: 'div',
        data: { id: 'app' },
        children: [{
            tag: 'p',
            data: {
                class: 'demo'
            }
        }]
 */

// let div = createElement('div', { id: 'text1' }, [
//     createElement('p', { key: 'a', style: { color: 'pink' } }, '文本节点1'),
//     createElement('p', { key: 'b', '@click': () => { alert("xx") } }, '文本节点2'),
//     createElement('p', { key: 'c', 'class': 'item' }, '文本节点3'),
//     createElement('p', { key: 'd' }, '文本节点4')
// ])

// 旧的 VNode
const prevVNode = createElement('div', null, [
    createElement('p', { key: 'a', style: { color: 'blue' } }, '节点a'),
    createElement('p', { key: 'b', '@click': () => { alert('呵呵') } }, '节点b'),
    createElement('p', { key: 'c' }, '节点c'),
    createElement('p', { key: 'd' }, '节点d'),
])

// 新的 VNode
const nextVNode = createElement('div', null, [
    createElement('p', { key: 'd' }, '节点d'),
    createElement('p', { key: 'a', style: { color: 'red' } }, '节点a'),
    createElement('p', { key: 'b', '@click': () => { alert('哈哈') } }, '节点b'),
    createElement('p', { key: 'f' }, '节点f'),
    createElement('p', { key: 'e', class: "item-header" }, '节点e'),
])

render(prevVNode, document.getElementById('app'))
console.log(prevVNode);
// console.log(nextVNode);


// 2秒后更新
// setTimeout(() => {
//     render(nextVNode, document.getElementById('app'))
// }, 1000)


// 渲染
// render(div, document.querySelector('#app'))

// console.log(div);