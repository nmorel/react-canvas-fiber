import { SVGPathData } from "svg-pathdata";
import type { SVGCommand, CommandA } from "svg-pathdata/src/types";

// Took from here : https://github.com/canvg/canvg/blob/master/src/Document/PathElement.ts#L494
function drawArc(
  context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  lastX: number,
  lastY: number,
  { rX, rY, xRot, lArcFlag, sweepFlag, x, y }: CommandA
) {
  // --------------------
  // rX, rY, xRot, lArcFlag, sweepFlag, x, y
  // are the 6 data items in the SVG path declaration following the A
  //
  // lastX and lastY are the previous point on the path before the arc
  // --------------------
  // useful functions
  const m = function (v: readonly [number, number]) {
    return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
  };
  const r = function (
    u: readonly [number, number],
    v: readonly [number, number]
  ) {
    return (u[0] * v[0] + u[1] * v[1]) / (m(u) * m(v));
  };
  const ang = function (
    u: readonly [number, number],
    v: readonly [number, number]
  ) {
    return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(r(u, v));
  };
  // --------------------

  const currpX =
    (Math.cos(xRot) * (lastX - x)) / 2.0 + (Math.sin(xRot) * (lastY - y)) / 2.0;
  const currpY =
    (-Math.sin(xRot) * (lastX - x)) / 2.0 +
    (Math.cos(xRot) * (lastY - y)) / 2.0;

  const l =
    Math.pow(currpX, 2) / Math.pow(rX, 2) +
    Math.pow(currpY, 2) / Math.pow(rY, 2);
  if (l > 1) {
    rX *= Math.sqrt(l);
    rY *= Math.sqrt(l);
  }

  let s =
    (lArcFlag === sweepFlag ? -1 : 1) *
    Math.sqrt(
      (Math.pow(rX, 2) * Math.pow(rY, 2) -
        Math.pow(rX, 2) * Math.pow(currpY, 2) -
        Math.pow(rY, 2) * Math.pow(currpX, 2)) /
        (Math.pow(rX, 2) * Math.pow(currpY, 2) +
          Math.pow(rY, 2) * Math.pow(currpX, 2))
    );
  if (isNaN(s)) {
    s = 0;
  }

  const cppX = (s * rX * currpY) / rY;
  const cppY = (s * -rY * currpX) / rX;
  const centpX =
    (lastX + x) / 2.0 + Math.cos(xRot) * cppX - Math.sin(xRot) * cppY;
  const centpY =
    (lastY + y) / 2.0 + Math.sin(xRot) * cppX + Math.cos(xRot) * cppY;

  const ang1 = ang([1, 0], [(currpX - cppX) / rX, (currpY - cppY) / rY]);
  const a = [(currpX - cppX) / rX, (currpY - cppY) / rY] as const;
  const b = [(-currpX - cppX) / rX, (-currpY - cppY) / rY] as const;
  let angd = ang(a, b);
  if (r(a, b) <= -1) {
    angd = Math.PI;
  }
  if (r(a, b) >= 1) {
    angd = 0;
  }

  const rad = rX > rY ? rX : rY;
  const sx = rX > rY ? 1 : rX / rY;
  const sy = rX > rY ? rY / rX : 1;

  context.translate(centpX, centpY);
  context.rotate(xRot);
  context.scale(sx, sy);
  context.arc(0, 0, rad, ang1, ang1 + angd, !sweepFlag);
  context.scale(1 / sx, 1 / sy);
  context.rotate(-xRot);
  context.translate(-centpX, -centpY);
}

export type SvgToCanvasContext = {
  previous?: SVGCommand;
  subpathStartX: number;
  subpathStartY: number;
  x: number; // current x
  y: number; // current y
  controlX: number; // current control point x
  controlY: number; // current control point y
  tempX?: number;
  tempY?: number;
};

export function svgToCanvas(
  commands: SVGCommand[],
  context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  dc: SvgToCanvasContext = {
    previous: null,
    subpathStartX: 0,
    subpathStartY: 0,
    x: 0, // current x
    y: 0, // current y
    controlX: 0, // current control point x
    controlY: 0, // current control point y
  }
): SvgToCanvasContext {
  context.beginPath();
  commands.forEach((command) => {
    switch (command.type) {
      case SVGPathData.LINE_TO:
        dc.x = command.x;
        dc.y = command.y;
        context.lineTo(dc.x, dc.y);
        break;

      case SVGPathData.HORIZ_LINE_TO:
        dc.x = command.x;
        context.lineTo(dc.x, dc.y);
        break;

      case SVGPathData.VERT_LINE_TO:
        dc.y = command.y;
        context.lineTo(dc.x, dc.y);
        break;

      case SVGPathData.MOVE_TO:
        dc.x = command.x;
        dc.y = command.y;
        dc.subpathStartX = dc.x;
        dc.subpathStartY = dc.y;
        context.moveTo(dc.x, dc.y);
        break;

      case SVGPathData.CURVE_TO:
        dc.tempX = command.x;
        dc.tempY = command.y;

        dc.controlX = command.x2;
        dc.controlY = command.y2;

        dc.x = dc.tempX;
        dc.y = dc.tempY;

        context.bezierCurveTo(
          command.x1,
          command.y1,
          dc.controlX,
          dc.controlY,
          dc.x,
          dc.y
        );
        break;

      case SVGPathData.SMOOTH_CURVE_TO:
        dc.tempX = command.x;
        dc.tempY = command.y;

        if (
          !dc.previous ||
          (dc.previous.type !== SVGPathData.CURVE_TO &&
            dc.previous.type !== SVGPathData.SMOOTH_CURVE_TO)
        ) {
          // If there is no previous command or if the previous command was not a C, c, S, or s,
          // the control point is coincident with the segment point
          dc.controlX = dc.x;
          dc.controlY = dc.y;
        } else {
          // calculate reflection of previous control points
          dc.controlX = 2 * dc.x - dc.controlX;
          dc.controlY = 2 * dc.y - dc.controlY;
        }

        dc.x = dc.tempX;
        dc.y = dc.tempY;

        context.bezierCurveTo(
          dc.controlX,
          dc.controlY,
          command.x2,
          command.y2,
          dc.x,
          dc.y
        );

        // set control point to 2nd one of this command
        // "... the first control point is assumed to be
        // the reflection of the second control point on
        // the previous command relative to the segment point."
        dc.controlX = command.x2;
        dc.controlY = command.y2;

        break;

      case SVGPathData.QUAD_TO:
        dc.tempX = command.x;
        dc.tempY = command.y;

        dc.controlX = command.x1;
        dc.controlY = command.y1;

        dc.x = dc.tempX;
        dc.y = dc.tempY;

        context.quadraticCurveTo(dc.controlX, dc.controlY, dc.x, dc.y);
        break;

      case SVGPathData.SMOOTH_QUAD_TO:
        dc.tempX = command.x;
        dc.tempY = command.y;

        if (
          !dc.previous ||
          (dc.previous.type !== SVGPathData.QUAD_TO &&
            dc.previous.type !== SVGPathData.SMOOTH_QUAD_TO)
        ) {
          // If there is no previous command or if the previous command was not a Q, q, T or t,
          // assume the control point is coincident with the segment point
          dc.controlX = dc.x;
          dc.controlY = dc.y;
        } else {
          // calculate reflection of previous control point
          dc.controlX = 2 * dc.x - dc.controlX;
          dc.controlY = 2 * dc.y - dc.controlY;
        }

        dc.x = dc.tempX;
        dc.y = dc.tempY;

        context.quadraticCurveTo(dc.controlX, dc.controlY, dc.x, dc.y);
        break;

      case SVGPathData.ARC:
        drawArc(context, dc.x, dc.y, command);
        dc.x = command.x;
        dc.y = command.y;
        break;

      case SVGPathData.CLOSE_PATH:
        dc.x = dc.subpathStartX;
        dc.y = dc.subpathStartY;
        context.closePath();
        break;

      default:
        break;
    }
    dc.previous = command;
  });

  return dc;
}
