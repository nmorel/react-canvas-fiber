function doesBrowserSupportOffscreenCanvas(): boolean {
  try {
    const canvas = new OffscreenCanvas(0, 0);
    const context = canvas.getContext("2d", { alpha: true });
    return !!context;
  } catch {
    return false;
  }
}

const hasOffscreenCanvas = doesBrowserSupportOffscreenCanvas();

/**
 * Creates a canvas usable for offscreen manipulation like cache, text measurement, etc...
 * If OffscreenCanvas is supported by the browser, it will an OffscreenCanvas (more performant for this type of operation).
 * Otherwise, it returns a classic canvas element.
 * @param width Width of the canvas
 * @param height Height of the canvas
 * @returns the created canvas
 */
export function createOffscreenCanvas(
  width: number,
  height: number
): OffscreenCanvas | HTMLCanvasElement {
  if (hasOffscreenCanvas) {
    return new OffscreenCanvas(width, height);
  } else {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
}
