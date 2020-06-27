import { vnodeType, childrenType } from './createElement'
import { mount } from './mount'

export function patch(pre, next, container) {
    const { flag: preFlag } = pre
    const { flag: nextFlag } = next


    // 新老虚拟节点类型不一致，直接替换
    if (preFlag !== nextFlag) {
        replaceVnode(pre, next, container)
    } else if (nextFlag === vnodeType.HTML) {
        patchElement(pre, next, container)
    } else if (nextFlag === vnodeType.TEXT) {
        patchText(pre, next, container)
    }
}



export function patchData(el, key, pre, next) {
    // 宗旨：新的全覆盖，老的有新的没有直接干掉
    switch (key) {
        case 'style':
            for (let k in next) {
                el.style[k] = next[k]
            }
            // 老的有，新的没有的属性直接删除
            for (let k in pre) {
                if (!next.hasOwnProperty(k)) {
                    el.style[k] = ''
                }
            }
            break
        case 'class':
            el.className = next
            break
        default:
            if (key[0] === '@') {
                //先把老的事件清除
                if (pre) {
                    el.removeEventListener(key.slice(1), pre)
                }
                el.addEventListener(key.slice(1), next)
            } else {
                el.setAttribute(key, next)
            }


    }
}

function replaceVnode(pre, next, container) {
    container.removeChild(pre.el)
    mount(next, container)
}

function patchText(pre, next, ) {
    let el = next.el = pre.el


    if (el.children != pre.children) {
        el.nodeValue = next.children
    }
}

function patchElement(pre, next, container) {
    // 先查看tag是否一样，直接把老的虚拟节点换成新的
    if (pre.tag !== next.tag) {
        replaceVnode(pre, next, container)
    } else {
        // tag一样开始diff属性
        let el = next.el = pre.el
        let preData = pre.data
        let nextData = next.data

        // data里面键一样的拿去更新
        if (nextData) {
            for (let k in nextData) {
                let nextVal = nextData[k]
                patchData(el, k, null, nextVal)
            }
        }

        // 老的有新的没有
        if (preData) {
            for (let k in preData) {
                let preVal = preData[k]
                if (preVal && !nextData.hasOwnProperty(k)) {
                    patchData(el, k, preVal, null)
                }
            }
        }

        //属性diff完成后，patch子节点
        patchChildren(pre.childrenFlag, next.childrenFlag, pre.children, next.children, el)
    }
}

function patchChildren(preChildrenFlag, nextChildrenFlag, preChildren, nextChildren, container) {
    switch (preChildrenFlag) {
        case childrenType.SINGLE:
            switch (nextChildrenFlag) {

                case childrenType.SINGLE:
                    patch(preChildren, nextChildren, container)
                    break;

                case childrenType.EMPTY:
                    container.removeChild(preChildren)
                    break;

                case childrenType.MANY:
                    container.removeChild(preChildren)
                    nextChildren.forEach(children => mount(children, container))
                    break;
            }
            break;

        case childrenType.EMPTY:
            switch (nextChildrenFlag) {

                case childrenType.SINGLE:
                    mount(nextChildren, container)
                    break;

                case childrenType.EMPTY:
                    break;

                case childrenType.MANY:
                    nextChildren.forEach(children => mount(children, container))
                    break;
            }
            break;
        case childrenType.MANY:
            switch (nextChildrenFlag) {

                case childrenType.SINGLE:
                    preChildren.forEach(children => container.removeChild(children))
                    mount(nextChildren, container)
                    break;

                case childrenType.EMPTY:
                    preChildren.forEach(children => container.removeChild(children))
                    break;

                case childrenType.MANY:
                    // 重点
                    // reactDiffChild(preChildren, nextChildren, container)
                    vueDiffChild(preChildren, nextChildren, container)
                    break;
            }
            break;
    }
}
//react中diff核心的处理方法，较为简单但是缺点很大
function reactDiffChild(prevChildren, nextChildren, container) {
    let lastIndex = 0
    for (let i = 0; i < nextChildren.length; i++) {
        const nextVNode = nextChildren[i]
        let j = 0,
            find = false
        for (j; j < prevChildren.length; j++) {
            const prevVNode = prevChildren[j]
            if (nextVNode.key === prevVNode.key) {
                find = true

                // 去更新一下内部
                patch(prevVNode, nextVNode, container)

                if (j < lastIndex) {
                    // 老节点需要移动
                    const refNode = nextChildren[i - 1].el.nextSibling
                    container.insertBefore(prevVNode.el, refNode)
                    break
                } else {
                    // 更新 lastIndex
                    lastIndex = j
                }
            }
        }
        if (!find) {
            // 挂载新节点
            const refNode =
                // 判断一下是不是首节点
                i - 1 < 0 ?
                prevChildren[0].el :
                nextChildren[i - 1].el.nextSibling

            mount(nextVNode, container, refNode)
        }
    }
    // 移除已经不存在的节点
    for (let i = 0; i < prevChildren.length; i++) {
        const prevVNode = prevChildren[i]
        const has = nextChildren.find(
            nextVNode => nextVNode.key === prevVNode.key
        )
        if (!has) {
            // 移除
            container.removeChild(prevVNode.el)
        }
    }
}
//vue中的diff核心处理方法，较为复杂，优于react
function vueDiffChild(prevChildren, nextChildren, container) {
    let oldStartIndex = 0
    let oldEndIndex = prevChildren.length - 1
    let oldStartVnode = prevChildren[0]
    let oldEndVnode = prevChildren[oldEndIndex]

    let newStartIndex = 0
    let newEndIndex = nextChildren.length - 1
    let newStartVnode = nextChildren[0]
    let newEndVnode = nextChildren[newEndIndex]

    // 五种情况：头头，尾尾，头尾，尾头，暴力循环
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        //头头匹配
        if (oldStartVnode.key === newStartVnode.key) {
            // 更新内部
            patch(oldStartVnode, newStartVnode, container)

            // 指针后移
            oldStartVnode = prevChildren[++oldStartIndex]
            newStartVnode = nextChildren[++newStartIndex]
        }
        // 尾尾匹配
        else if (oldEndVnode.key === newEndVnode.key) {
            // 更新内部
            patch(oldEndVnode, newEndVnode, container)

            // 指针前移
            oldEndVnode = prevChildren[--oldEndIndex]
            newEndVnode = nextChildren[--newEndIndex]
        }
        // 新尾老头匹配
        else if (newEndVnode.key === oldStartVnode.key) {

            patch(oldStartVnode, newEndVnode, container)

            // 将老的头整到最后
            container.appendChild(oldStartVnode.el)

            // 新指针前移，老指针后移

            oldStartVnode = prevChildren[++oldStartIndex]
            newEndVnode = nextChildren[--newEndIndex]
        }
        // 新头老尾匹配
        else if (newStartVnode.key === oldEndVnode.key) {

            patch(oldEndVnode, newStartVnode, container)

            // 将老的尾整到前面去
            container.insertBefore(oldEndVnode.el, oldStartVnode.el)

            //新指针后移，老指针前移
            newStartVnode = nextChildren[++newStartIndex]
            oldEndVnode = prevChildren[--oldEndIndex]


        }
        // 均不能匹配
        else {
            let index;
            let map = keyMapByIndex(prevChildren)
            if (map.hasOwnProperty(newStartVnode.key)) {
                index = map[newStartVnode.key]
                    // 找到了，则开始移动
                let toMoveNode = prevChildren[index]
                patch(toMoveNode, newEndVnode, container)
                container.insertBefore(toMoveNode, oldStartIndex)
            } else {
                // 没有找到即挂到新指针之前的位置
                mount(newStartVnode, container, oldStartVnode.el)
            }

            // 后移指针
            newStartVnode = nextChildren[++newStartIndex]
        }



    }


    // 创建一个映射表
    // {a:0,b:1}
    function keyMapByIndex(prevChildren) {
        let map = {}
        for (let i = 0; i < prevChildren; i++) {
            let current = prevChildren[i]
            if (current.key) {
                map[current.key] = i
            }
        }
        return map
    }

    // 将多余的放进去
    if (newStartIndex <= newEndIndex) {
        for (let i = newStartIndex; i <= newEndIndex; i++) {

            let beforeElement = nextChildren[newEndIndex + 1] == null ? null : nextChildren[newEndIndex + 1].el
            if (beforeElement == null) {
                // 从前往后匹配剩余

                container.appendChild(nextChildren[i])

            } else {
                // 从后往前匹配剩余
                // 开始插
                container.insertBefore(nextChildren[i], beforeElement.el)

            }

        }
    }
    // 如果老的还有循环完，即剩下的是要删除的
    if (oldStartIndex <= oldEndIndex) {
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            container.removeChild(prevChildren[i].el)
        }
    }
}