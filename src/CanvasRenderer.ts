import { DIRECTION_LTR } from "yoga-layout-prebuilt";
import { ViewStyle } from "./Style";
import { Base, Text } from "./YogaComponents";

function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

export class CanvasRenderer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  containerWidth: number;
  containerHeight: number;
  scaleRatio = 1;

  constructor(
    canvas: HTMLCanvasElement,
    options: { width: number; height: number }
  ) {
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

    this.draw();
  }

  draw() {
    const ctx = this.context;
    ctx.clearRect(
      0,
      0,
      this.containerWidth * this.scaleRatio,
      this.containerHeight * this.scaleRatio
    );

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    for (let i = 0; i < 10; i++) {
      const item = generateItem({
        translateX: getRandomInt(500),
        translateY: getRandomInt(300),
        scale: getRandomInt(3),
      });
      item.render(ctx);
    }

    ctx.restore();
  }

  dispose() {
    // TODO destroy any listener added
  }
}

const generateItem = (transform: ViewStyle["transform"]) => {
  const item = new Base({
    style: {
      width: 160,
      backgroundColor: "yellow",
      justifyContent: "center",
      transform,
    },
    children: [
      new Base({
        style: {
          margin: 5,
          width: 150,
          height: 50,
          backgroundColor: "red",
          justifyContent: "center",
          alignItems: "center",
        },
        children: [
          new Text({
            text: "Test joke",
            style: { fontSize: 24 },
            children: [],
          }),
        ],
      }),
      new Base({
        style: {
          padding: 5,
          flexDirection: "row",
          justifyContent: "space-between",
        },
        children: [
          new Base({
            style: {
              flex: 0,
              width: 40,
              backgroundColor: "green",
            },
            children: [],
          }),
          new Base({
            style: {
              width: 60,
              height: 40,
              backgroundColor: "green",
            },
            children: [],
          }),
        ],
      }),
    ],
  });
  item.node.calculateLayout(void 0, void 0, DIRECTION_LTR);
  return item;
};
