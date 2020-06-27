import { mount } from './mount'
import { patch } from './patch'
export function render(vnode, container) {

    if (container.vnode) {
        // 再次渲染 需要diff
        patch(container.vnode, vnode, container)

    } else {
        // 首次渲染 直接mount
        mount(vnode, container)
    }
    // 保存vnode以供下次diff
    container.vnode = vnode

}