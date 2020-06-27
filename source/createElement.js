 export const vnodeType = {
     HTML: 'HTML',
     TEXT: 'TEXT'
 }
 export const childrenType = {
     EMPTY: 'EMPTY',
     SINGLE: 'SINGLE', //代表文本节点
     MANY: 'MANY'
 }

 export default function createElement(tag, data, children = null) {
     let flag, childrenFlag
     typeof tag === 'string' ? flag = vnodeType.HTML : flag = vnodeType.TEXT


     if (children == null) {
         childrenFlag = childrenType.EMPTY

     } else if (Array.isArray(children)) {

         if (children.length == 0) {
             childrenFlag = childrenType.EMPTY
         } else {
             childrenFlag = childrenType.MANY
         }
     }
     //  如果children不是一个数组，则代表它是一个文本节点
     else if (typeof children === 'string') {

         childrenFlag = childrenType.SINGLE
         children = createTextVnode(children + "")
     }

     return {
         flag, //表示vnode的类型
         tag,
         data,
         key: data && data.key,
         childrenFlag,
         children,
         el: null
     }
 }

 function createTextVnode(text) {
     return {
         flag: vnodeType.TEXT,
         tag: null,
         data: null,
         childrenFlag: childrenType.EMPTY,
         children: text,

     }
 }