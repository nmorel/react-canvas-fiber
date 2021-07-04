import Reconciler from "react-reconciler";
import { unstable_now as now } from "scheduler";
import { CanvasRenderer } from "./CanvasRenderer";
import { HasChildren } from "./HasChildren";
import {
  BaseElement,
  Image,
  Svg,
  SvgChild,
  Text,
  View,
} from "./YogaComponents";

const roots = new Map<CanvasRenderer, Reconciler.FiberRoot>();

function appendChild(parentInstance: HasChildren, child: BaseElement) {
  parentInstance?.addChild(child);
}

function insertBefore(
  parentInstance: HasChildren,
  child: BaseElement,
  beforeChild: BaseElement
) {
  parentInstance?.insertChildBefore(child, beforeChild);
}

function removeChild(parentInstance: HasChildren, child: BaseElement) {
  parentInstance?.removeChild(child);
  child.destroy();
  child.container.removeListenersFromElement(child);
}

type Props = JSX.IntrinsicElements["c-view"] & {
  [key: string]: unknown;
};

let Renderer = Reconciler<
  "c-view" | "c-text" | "c-image" | "c-svg" | "path",
  Props,
  CanvasRenderer,
  BaseElement,
  undefined,
  unknown,
  undefined,
  BaseElement | null | undefined,
  undefined,
  Partial<Props>,
  unknown,
  number | undefined,
  number
>({
  now,
  createInstance(type, props, container) {
    switch (type) {
      case "c-view": {
        return new View(props, container);
      }
      case "c-text": {
        return new Text(props as any, container);
      }
      case "c-image": {
        return new Image(props as any, container);
      }
      case "c-svg": {
        return new Svg(props as any, container);
      }
      case "path": {
        return new SvgChild(props as any, container);
      }
      default:
        throw new Error(`unknown type ${type}`);
    }
  },

  prepareUpdate(instance, type, oldProps, newProps) {
    return newProps;
  },
  commitUpdate(instance, updatePayload) {
    instance.update(updatePayload);
  },

  appendChild,
  appendInitialChild: appendChild,
  appendChildToContainer: appendChild,

  insertBefore,
  insertInContainerBefore: insertBefore,

  removeChild,
  removeChildFromContainer: removeChild,

  hideInstance() {
    // TODO may have something to do here with suspense
    //   if (instance.isObject3D) {
    //     instance.visible = false
    //     invalidateInstance(instance)
    //   }
  },
  unhideInstance() {
    // TODO may have something to do here with suspense
    //   if ((instance.isObject3D && props.visible == null) || props.visible) {
    //     instance.visible = true
    //     invalidateInstance(instance)
    //   }
  },

  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  isPrimaryRenderer: false,

  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,
  queueMicrotask:
    typeof window.queueMicrotask !== "function"
      ? window.queueMicrotask
      : (cb) =>
          Promise.resolve()
            .then(cb)
            .catch((e) =>
              setTimeout(() => {
                throw e;
              })
            ),

  getPublicInstance(instance) {
    return instance;
  },
  getRootHostContext() {
    return null;
  },
  getChildHostContext(parentHostContext) {
    return parentHostContext;
  },
  finalizeInitialChildren() {
    return false;
  },
  commitMount() {
    // https://github.com/facebook/react/issues/20271
    // This will make sure events are only added once to the central container
    // const container = instance.__container;
    // if (container && instance.raycast && instance.__handlers)
    //   container.__interaction.push(instance);
  },
  prepareForCommit() {
    return null;
  },
  preparePortalMount() {
    // noop
  },
  resetAfterCommit(container) {
    // noop
  },
  clearContainer() {
    // noop
  },

  // Text operations, should not happen
  createTextInstance() {
    throw new Error(
      "Text is not allowed in the react-canvas-fiber tree. You may have extraneous whitespace between components."
    );
  },
  hideTextInstance() {
    throw new Error(
      "Text is not allowed in the react-canvas-fiber tree. You may have extraneous whitespace between components."
    );
  },
  shouldSetTextContent() {
    return false;
  },
});

export function render(
  element: React.ReactNode,
  canvasRenderer: CanvasRenderer
) {
  let root = roots.get(canvasRenderer);
  if (!root) {
    let newRoot = (root = Renderer.createContainer(
      canvasRenderer,
      0,
      false,
      null
    ));
    roots.set(canvasRenderer, newRoot);
  }
  Renderer.updateContainer(element, root, null, () => undefined);
  return Renderer.getPublicRootInstance(root);
}
