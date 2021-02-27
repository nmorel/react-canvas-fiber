import { HasChildren } from "./HasChildren";

export class CanvasRenderer extends HasChildren {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  containerWidth: number;
  containerHeight: number;
  scaleRatio = 1;

  constructor(
    canvas: HTMLCanvasElement,
    options: { width: number; height: number }
  ) {
    super();

    this.canvas = canvas;
    this.context = canvas.getContext("2d", { alpha: true });
    this.updateDimensions(options);
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
    console.log('drawing canvas')
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

  dispose() {
    // TODO destroy any listener added
  }
}
