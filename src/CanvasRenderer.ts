import { HasChildren } from "./HasChildren";
import { View, ViewProps } from "./YogaComponents";

export class CanvasRenderer extends HasChildren {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  containerWidth = 0;
  containerHeight = 0;
  scaleRatio = 1;

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

  _onPointerUp = (evt: PointerEvent) => {
    this._handleEvent(evt, "onPointerUp");
  };

  _addOrRemoveListeners(add: boolean) {
    let fn = add
      ? this.canvas.addEventListener
      : this.canvas.removeEventListener;
    fn("pointerdown", this._onPointerDown);
    fn("pointermove", this._onPointerMove);
    fn("pointerup", this._onPointerUp);
  }

  _handleEvent(evt: PointerEvent, eventName: string) {
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

    const customEvent = {
      nativeEvent: evt,
      currentTarget: target,
      target,
      isStopped: false,
      stopPropagation() {
        this.isStopped = true;
      },
      stopImmediatePropagation() {
        this.isStopped = true;
      },
      preventDefault() {
        evt.preventDefault();
      },
    };

    // Capture phase
    for (const view of targets) {
      if (view.props[`${eventName}Capture`]) {
        customEvent.currentTarget = view;
        view.props[`${eventName}Capture`](customEvent);
        if (customEvent.isStopped) {
          break;
        }
      }
    }
    if (customEvent.isStopped) {
      return;
    }
    // Bubbling phase
    for (let i = targets.length - 1; i >= 0; i--) {
      const view = targets[i];
      if (view.props[eventName]) {
        customEvent.currentTarget = view;
        view.props[eventName](customEvent);
        if (customEvent.isStopped) {
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

  dispose() {
    this._addOrRemoveListeners(false);
  }
}
