import { HasChildren } from "./HasChildren";
import { View, ViewProps } from "./YogaComponents";

export class CanvasRenderer extends HasChildren {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  containerWidth = 0;
  containerHeight = 0;
  scaleRatio = 1;

  private lastClickEvents: Map<
    View,
    { detail: number; timestamp: number }
  > = new Map();

  constructor(
    canvas: HTMLCanvasElement,
    options: { width: number; height: number }
  ) {
    super();

    this.canvas = canvas;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      throw new Error(`Can't create a 2d context on canvas`);
    }
    this.context = context;
    this.updateDimensions(options);
    this._addOrRemoveListeners(true);
  }

  updateDimensions({ width, height }: { width: number; height: number }) {
    this.containerWidth = width;
    this.containerHeight = height;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.scaleRatio = window.devicePixelRatio || 1;
    this.canvas.width = this.containerWidth * this.scaleRatio;
    this.canvas.height = this.containerHeight * this.scaleRatio;
  }

  draw() {
    console.log("drawing canvas");
    const ctx = this.context;
    ctx.clearRect(
      0,
      0,
      this.containerWidth * this.scaleRatio,
      this.containerHeight * this.scaleRatio
    );

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.children.forEach((child) => child.render(ctx));

    ctx.restore();
  }

  _onPointerDown = (evt: PointerEvent) => {
    this._handleEvent(evt, "onPointerDown");
  };

  _onPointerMove = (evt: PointerEvent) => {
    this._handleEvent(evt, "onPointerMove");
  };

  _onPointerOver = (evt: PointerEvent) => {
    this._handleEvent(evt, "onPointerOver");
  };

  _onPointerUp = (evt: PointerEvent) => {
    this._handleEvent(evt, "onPointerUp");
  };

  _onClick = (evt: MouseEvent) => {
    this._handleEvent(evt, "onTap");
  };

  _onWheel = (evt: WheelEvent) => {
    this._handleEvent(evt, "onWheel");
  };

  _addOrRemoveListeners(add: boolean) {
    let fn = add
      ? this.canvas.addEventListener
      : this.canvas.removeEventListener;
    fn("pointerdown", this._onPointerDown);
    fn("pointermove", this._onPointerMove);
    fn("pointerup", this._onPointerUp);
    fn("pointerover", this._onPointerOver);
    fn("wheel", this._onWheel);
    fn("click", this._onClick);
  }

  _handleEvent(evt: MouseEvent, eventName: RCF.MouseEventType): void;
  _handleEvent(evt: PointerEvent, eventName: RCF.PointerEventType): void;
  _handleEvent(evt: WheelEvent, eventName: RCF.WheelEventType): void;
  _handleEvent<Event extends MouseEvent | PointerEvent | WheelEvent>(
    evt: Event,
    eventName: RCF.EventType
  ): void {
    const { left, top } = this.canvas.getBoundingClientRect();
    const pointer = {
      x: evt.clientX - left,
      y: evt.clientY - top,
    };
    const targets: View[] = [];
    for (let i = this.children.length - 1; i >= 0; i--) {
      if (this._findTargetOnView(this.children[i], pointer, targets)) {
        break;
      }
    }
    if (!targets.length) {
      return;
    }

    const target = targets[targets.length - 1];

    let {
      target: nativeTarget,
      currentTarget,
      eventPhase,
      defaultPrevented,
      preventDefault,
      stopPropagation,
      timeStamp,
      ...evtProps
    } = evt;

    const customEvent: RCF.Event<Event, View> = {
      ...evtProps,
      timestamp: performance.now(),
      nativeEvent: evt,
      target,
      currentTarget: target,
      eventPhase: 0,
      get defaultPrevented() {
        return evt.defaultPrevented;
      },
      preventDefault() {
        evt.preventDefault();
      },
      isPropagationStopped: false,
      stopPropagation() {
        this.isPropagationStopped = true;
      },
      canvasX: pointer.x,
      canvasY: pointer.y,
    };

    let doubleTapTargets: View[] | undefined;
    if (eventName === "onTap") {
      doubleTapTargets = [];
      for (const target of targets) {
        let entry = this.lastClickEvents.get(target);
        if (!entry) {
          entry = {
            detail: 0,
            timestamp: 0,
          };
          this.lastClickEvents.set(target, entry);
        } else if (customEvent.timestamp - entry.timestamp > 400) {
          entry.detail = 0;
        }
        entry.detail++;
        entry.timestamp = customEvent.timestamp;
        if (entry.detail === 2) {
          doubleTapTargets.push(target);
        }
      }
    }

    this._callHandlers(targets, customEvent, eventName);

    if (doubleTapTargets?.length) {
      this._callHandlers(doubleTapTargets, customEvent, "onDoubleTap");
    }
  }

  _callHandlers(
    targets: View[],
    customEvent: RCF.Event<any, any>,
    eventName: RCF.EventType
  ) {
    // Capture phase
    customEvent.eventPhase = 1;
    for (const view of targets) {
      const handler = view.props[`${eventName}Capture` as const] as (
        evt: typeof customEvent
      ) => void | undefined;
      if (handler) {
        customEvent.currentTarget = view;
        customEvent.detail =
          eventName === "onTap"
            ? this.lastClickEvents.get(view)?.detail || 1
            : eventName === "onDoubleTap"
            ? 2
            : 0;
        handler(customEvent);
        if (customEvent.isPropagationStopped) {
          break;
        }
      }
    }
    if (customEvent.isPropagationStopped) {
      return;
    }
    // Bubbling phase
    customEvent.eventPhase = 3;
    for (let i = targets.length - 1; i >= 0; i--) {
      const view = targets[i];
      const handler = view.props[eventName] as (
        evt: typeof customEvent
      ) => void | undefined;
      if (handler) {
        customEvent.currentTarget = view;
        customEvent.detail =
          eventName === "onTap"
            ? this.lastClickEvents.get(view)?.detail || 1
            : eventName === "onDoubleTap"
            ? 2
            : 0;
        handler(customEvent);
        if (customEvent.isPropagationStopped) {
          break;
        }
      }
    }
  }

  _findTargetOnView(
    view: View,
    pointer: { x: number; y: number },
    targets: View[]
  ): boolean {
    pointer = this._normalizePoint(pointer, view.props.transformMatrix);
    if (
      pointer.x < view.node.getComputedLeft() ||
      pointer.x > view.node.getComputedLeft() + view.node.getComputedWidth() ||
      pointer.y < view.node.getComputedTop() ||
      pointer.y > view.node.getComputedTop() + view.node.getComputedHeight()
    ) {
      return false;
    }

    targets.push(view);
    for (let i = view.children.length - 1; i >= 0; i--) {
      if (this._findTargetOnView(view.children[i], pointer, targets)) {
        break;
      }
    }
    return true;
  }

  _normalizePoint(
    pointer: { x: number; y: number },
    matrix: ViewProps["transformMatrix"]
  ) {
    if (!matrix) return pointer;

    const { x, y } = pointer;
    const [a, b, c, d, tx, ty] = matrix;
    const id = 1 / (a * d + c * -b);
    return {
      x: d * id * x + -c * id * y + (ty * c - tx * d) * id,
      y: a * id * y + -b * id * x + (-ty * a + tx * b) * id,
    };
  }

  removeListenersFromView(view: View) {
    this.lastClickEvents.delete(view);
  }

  dispose() {
    this._addOrRemoveListeners(false);
  }
}
