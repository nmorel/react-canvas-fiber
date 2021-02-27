import { Children } from 'react'
import Reconciler from 'react-reconciler'
import { unstable_now as now, unstable_IdlePriority as idlePriority, unstable_runWithPriority as run } from 'scheduler'
import { CanvasRenderer } from './CanvasRenderer'
import { View } from './YogaComponents'

const roots = new Map<CanvasRenderer, Reconciler.FiberRoot>()
const emptyObject = {}
const is = {
  obj: (a: any) => a === Object(a) && !is.arr(a),
  fun: (a: any) => typeof a === 'function',
  str: (a: any) => typeof a === 'string',
  num: (a: any) => typeof a === 'number',
  und: (a: any) => a === void 0,
  arr: (a: any) => Array.isArray(a),
  equ(a: any, b: any) {
    // Wrong type or one of the two undefined, doesn't match
    if (typeof a !== typeof b || !!a !== !!b) return false
    // Atomic, just compare a against b
    if (is.str(a) || is.num(a) || is.obj(a)) return a === b
    // Array, shallow compare first to see if it's a match
    if (is.arr(a) && a == b) return true
    // Last resort, go through keys
    let i
    for (i in a) if (!(i in b)) return false
    for (i in b) if (a[i] !== b[i]) return false
    return is.und(i) ? a === b : true
  },
}

function appendChild(parentInstance, child) {
    console.log(parentInstance, child)
}

let Renderer = Reconciler({
    now,
    createInstance(type, {children, ...props}, rootContainerInstance, hostContext, internalInstanceHandle) {
        console.log(type, props, rootContainerInstance, hostContext, internalInstanceHandle)
        switch(type) {
            case 'view': {
                // @ts-ignore
                const view = new View(props)
                // @ts-ignore
                // rootContainerInstance.addChild(view)
                return view
            }
            default: 
                return null
        }
    },
    removeChild: () => void 0,
    appendChild,
    insertBefore: () => void 0,
    // warnsIfNotActing: true,
    supportsMutation: true,
    isPrimaryRenderer: false,
    scheduleTimeout: is.fun(setTimeout) ? setTimeout : undefined,
    cancelTimeout: is.fun(clearTimeout) ? clearTimeout : undefined,
    // @ts-ignore
    setTimeout: is.fun(setTimeout) ? setTimeout : undefined,
    // @ts-ignore
    clearTimeout: is.fun(clearTimeout) ? clearTimeout : undefined,
    noTimeout: -1,
    appendInitialChild: appendChild,
    appendChildToContainer: appendChild,
    removeChildFromContainer: () => void 0, //: removeChild,
    insertInContainerBefore: () => void 0, //: insertBefore,
    commitUpdate(instance: any, updatePayload: any, type: string, oldProps: any, newProps: any, fiber: Reconciler.Fiber) {
    //   if (instance.__instance && newProps.object && newProps.object !== instance) {
    //     // <instance object={...} /> where the object reference has changed
    //     switchInstance(instance, type, newProps, fiber)
    //   } else {
    //     // This is a data object, let's extract critical information about it
    //     const { args: argsNew = [], ...restNew } = newProps
    //     const { args: argsOld = [], ...restOld } = oldProps
    //     // If it has new props or arguments, then it needs to be re-instanciated
    //     const hasNewArgs = argsNew.some((value: any, index: number) =>
    //       is.obj(value)
    //         ? Object.entries(value).some(([key, val]) => val !== argsOld[index][key])
    //         : value !== argsOld[index]
    //     )
    //     if (hasNewArgs) {
    //       // Next we create a new instance and append it again
    //       switchInstance(instance, type, newProps, fiber)
    //     } else {
    //       // Otherwise just overwrite props
    //       applyProps(instance, restNew, restOld, true)
    //     }
    //   }
    },
    hideInstance(instance: any) {
    //   if (instance.isObject3D) {
    //     instance.visible = false
    //     invalidateInstance(instance)
    //   }
    },
    unhideInstance(instance: any) {
    //   if ((instance.isObject3D && props.visible == null) || props.visible) {
    //     instance.visible = true
    //     invalidateInstance(instance)
    //   }
    },
    hideTextInstance() {
      throw new Error(
        'Text is not allowed in the react-canvas-fiber tree. You may have extraneous whitespace between components.'
      )
    },
    getPublicInstance(instance: any) {
      return instance
    },
    getRootHostContext() {
      return emptyObject
    },
    getChildHostContext() {
      return emptyObject
    },
    createTextInstance() {
        throw new Error(
          'Text is not allowed in the react-canvas-fiber tree. You may have extraneous whitespace between components.'
        )
    },
    finalizeInitialChildren(instance: any) {
      // https://github.com/facebook/react/issues/20271
      // Returning true will trigger commitMount
      return instance.__handlers
    },
    commitMount(instance: any /*, type, props*/) {
      // https://github.com/facebook/react/issues/20271
      // This will make sure events are only added once to the central container
      const container = instance.__container
      if (container && instance.raycast && instance.__handlers) container.__interaction.push(instance)
    },
    prepareUpdate() {
      return emptyObject
    },
    shouldDeprioritizeSubtree() {
      return false
    },
    prepareForCommit() {
      return null
    },
    preparePortalMount() {
      return null
    },
    resetAfterCommit() {
        // noop
    },
    shouldSetTextContent() {
      return false
    },
    clearContainer() {
      return false
    },
})


 export function render(
    element: React.ReactNode,
    canvasRenderer: CanvasRenderer) {

    let root = roots.get(canvasRenderer)
    if (!root) {
      // @ts-ignore
      let newRoot = (root = Renderer.createContainer(
        canvasRenderer,
        /*state !== undefined && state.current.concurrent ? 2 : */0,
        false,
        // @ts-ignore
        null
      ))
      roots.set(canvasRenderer, newRoot)
    }
    Renderer.updateContainer(element, root, null, () => undefined)
    return Renderer.getPublicRootInstance(root)
    }