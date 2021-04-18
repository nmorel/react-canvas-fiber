import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useMemo,
} from "react";
import { CanvasRenderer } from "../canvas/CanvasRenderer";
import { render } from "../canvas/ReactCanvasReconciler";
import { StoreContext, useStore } from "../useStore";
import { observer } from "mobx-react";
import * as React from "react";
import { round } from "lodash-es";
import { Store } from "../models/store";

const CanvasContext = createContext<CanvasRenderer>(null as any);

export function useCanvas() {
  return useContext(CanvasContext);
}

function useCanvasListeners(
  canvasRendererRef: React.MutableRefObject<CanvasRenderer | null | undefined>
): RCF.Handlers {
  const store = useStore();
  const panRef = useRef<{ lastX: number; lastY: number } | null>(null);

  return useMemo(
    () => ({
      onWheel: (evt: RCF.WheelEvent) => {
        evt.stopPropagation();

        const delta = evt.nativeEvent.deltaY;
        let newScale = store.sceneTransformMatrix[0];
        if (delta > 0) {
          if (newScale <= 0.1) {
            newScale -= 0.01;
          } else {
            newScale -= 0.1;
          }
        } else if (delta < 0) {
          if (newScale >= 0.1) {
            newScale += 0.1;
          } else {
            newScale += 0.01;
          }
        }
        newScale = round(newScale, 2);
        newScale = Math.max(0.01, Math.min(10, newScale));

        if (newScale === store.sceneTransformMatrix[0]) {
          return;
        }

        const positionCurrentZoom = {
          x:
            (evt.canvasX - store.sceneTransformMatrix[4]) /
            store.sceneTransformMatrix[0],
          y:
            (evt.canvasY - store.sceneTransformMatrix[5]) /
            store.sceneTransformMatrix[3],
        };
        const positionNewZoom = {
          x: positionCurrentZoom.x * newScale,
          y: positionCurrentZoom.y * newScale,
        };

        const newMatrix: Store["sceneTransformMatrix"] = [
          ...store.sceneTransformMatrix,
        ];
        newMatrix[0] = newScale;
        newMatrix[3] = newScale;
        newMatrix[4] = Math.round(evt.canvasX - positionNewZoom.x);
        newMatrix[5] = Math.round(evt.canvasY - positionNewZoom.y);
        store.setSceneTransformMatrix(newMatrix);
      },
      onPointerDown: (evt: RCF.PointerEvent) => {
        panRef.current = {
          lastX: evt.canvasX,
          lastY: evt.canvasY,
        };
        canvasRendererRef.current?.forceEventsTarget(canvasRendererRef.current);
      },
      onPointerMove: (evt: RCF.PointerEvent) => {
        if (!panRef.current) return;

        const deltaX = evt.canvasX - panRef.current.lastX;
        const deltaY = evt.canvasY - panRef.current.lastY;

        const newMatrix: Store["sceneTransformMatrix"] = [
          ...store.sceneTransformMatrix,
        ];
        newMatrix[4] = Math.round(newMatrix[4] + deltaX);
        newMatrix[5] = Math.round(newMatrix[5] + deltaY);
        store.setSceneTransformMatrix(newMatrix);

        panRef.current = {
          lastX: evt.canvasX,
          lastY: evt.canvasY,
        };
      },
      onPointerUp: () => {
        panRef.current = null;
        canvasRendererRef.current?.forceEventsTarget(null);
      },
    }),
    [store]
  );
}

export const Canvas = observer(function Canvas({
  children,
}: {
  children: any;
}) {
  const store = useStore();
  const { width, height, sceneTransformMatrix } = store;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>();
  const listeners = useCanvasListeners(rendererRef);

  useLayoutEffect(() => {
    if (!rendererRef.current) return;

    rendererRef.current.props.width = width;
    rendererRef.current.props.height = height;
    rendererRef.current?.updateDimensions();
  }, [width, height]);

  useLayoutEffect(() => {
    if (!rendererRef.current) return;

    rendererRef.current?.updateTransformMatrix(sceneTransformMatrix);
  }, [sceneTransformMatrix]);

  useLayoutEffect(() => {
    if (!rendererRef.current) return;

    rendererRef.current.props = {
      width: rendererRef.current.props.width,
      height: rendererRef.current.props.height,
      transformMatrix: rendererRef.current.props.transformMatrix,
      ...listeners,
    };
  }, [listeners]);

  useLayoutEffect(() => {
    if (!rendererRef.current && canvasRef.current) {
      rendererRef.current = new CanvasRenderer(canvasRef.current, {
        width,
        height,
        transformMatrix: sceneTransformMatrix,
        ...listeners,
      });
    }
    return () => {
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    if (!rendererRef.current) return;

    render(
      /* Have to repeat the provider here because we lost context by changing reconciler */
      <StoreContext.Provider value={store}>
        <CanvasContext.Provider value={rendererRef.current}>
          {children}
        </CanvasContext.Provider>
      </StoreContext.Provider>,
      rendererRef.current
    );
  }, [children]);

  return (
    <canvas
      ref={canvasRef}
      width={store.width}
      height={store.height}
      style={{
        width,
        height,
        overflow: "hidden",
        touchAction: "none",
        WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
        userSelect: "none",
      }}
    />
  );
});
