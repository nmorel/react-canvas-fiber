import { observer } from "mobx-react";
import React, { useMemo, useRef, useState } from "react";
import { Store } from "../models/store";
import { useStore } from "../useStore";
import { round } from "lodash-es";

export const Scene = observer(function Scene({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = useStore();
  const panRef = useRef<{ lastX: number; lastY: number } | null>(null);

  const listeners = useMemo(
    () => ({
      onWheel: (evt: RCF.WheelEvent) => {
        const delta = evt.nativeEvent.deltaY;
        let newScale = store.sceneTransformMatrix[0];
        if (delta > 0 && newScale > 0.01) {
          if (delta <= 0.1) {
            newScale -= 0.01;
          } else {
            newScale -= 0.1;
          }
        } else if (delta < 0 && newScale < 10) {
          if (newScale > 0.1) {
            newScale += 0.1;
          } else {
            newScale += 0.01;
          }
        }
        newScale = round(newScale, 2);

        if (newScale === store.sceneTransformMatrix[0] || newScale <= 0) {
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
          lastX: evt.pointerX,
          lastY: evt.pointerY,
        };
      },
      onPointerMove: (evt: RCF.PointerEvent) => {
        if (!panRef.current) return;

        const deltaX = evt.pointerX - panRef.current.lastX;
        const deltaY = evt.pointerY - panRef.current.lastY;

        const newMatrix: Store["sceneTransformMatrix"] = [
          ...store.sceneTransformMatrix,
        ];
        newMatrix[4] += deltaX;
        newMatrix[5] += deltaY;
        store.setSceneTransformMatrix(newMatrix);

        panRef.current = {
          lastX: evt.pointerX,
          lastY: evt.pointerY,
        };
      },
      onPointerUp: () => {
        panRef.current = null;
      },
    }),
    [store]
  );

  return (
    <c-view
      width={store.width / store.sceneTransformMatrix[0]}
      height={store.height / store.sceneTransformMatrix[3]}
      transformMatrix={store.sceneTransformMatrix}
      {...listeners}
    >
      {children}
    </c-view>
  );
});
