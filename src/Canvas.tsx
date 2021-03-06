import * as React from "react";
import { CanvasRenderer } from "./CanvasRenderer";
import { render } from "./ReactCanvasReconciler";

export function Canvas({
  width,
  height,
  children,
  style,
  ...canvasProps
}: {
  width: number;
  height: number;
  children: any;
} & React.CanvasHTMLAttributes<HTMLCanvasElement>) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const rendererRef = React.useRef<CanvasRenderer | null>();

  React.useLayoutEffect(() => {
    rendererRef.current?.updateDimensions({ width, height });
  }, [width, height]);

  React.useLayoutEffect(() => {
    if (!rendererRef.current && canvasRef.current) {
      rendererRef.current = new CanvasRenderer(canvasRef.current, {
        width,
        height,
      });
    }
    return () => {
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  const onInitCompRef = React.useRef<React.FC<{
    children: React.ReactElement;
  }> | null>();
  if (!onInitCompRef.current) {
    onInitCompRef.current = function OnInit(props: {
      children: React.ReactElement;
    }): JSX.Element {
      return props.children;
    };
  }

  React.useLayoutEffect(() => {
    if (!rendererRef.current || !onInitCompRef.current) return;

    const OnInit = onInitCompRef.current;
    render(<OnInit>{children}</OnInit>, rendererRef.current);
  }, [children]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ ...style, width, height }}
      {...canvasProps}
    />
  );
}
