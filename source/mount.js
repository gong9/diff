import { vnodeType, childrenType } from './createElement'
import { patchData } from './patch'
export function mount(vnode, container, refNode) {
    let { flag } = vnode
    if (flag == vnodeType.HTML) {
        mountElement(vnode, container, refNode)
    } else if (flag == vnodeType.TEXT) {
        mountText(vnode, container)
    }
}

// 挂载元素节点
function mountElement(vnode, container, refNode) {
    const dom = document.createElement(vnode.tag)
    vnode.el = dom
    const { data, children, childrenFlag } = vnode

    // 挂载属性
    if (data) {
        for (let key in data) {
            patchData(dom, key, null, data[key])
        }
    }
    // 挂载子元素

    if (childrenFlag !== childrenType.EMPTY) {
        // 挂载文本子节点
        if (childrenFlag === childrenType.SINGLE) {
            mount(children, dom)
        }
        //挂载元素子节点
        else if (childrenFlag === childrenType.MANY) {
            for (let i = 0; i < children.length; i++) {
                mount(children[i], dom)
            }
        }
    }
    refNode ? container.insertBefore(dom, refNode) : container.appendChild(dom)
}

// 挂载文本节点
function mountText(vnode, container) {
    const dom = document.createTextNode(vnode.children)
    vnode.el = dom
    container.appendChild(dom)
}